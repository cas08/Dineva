import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma-client";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get("id") || "0", 10);
    if (isNaN(restaurantId) || !restaurantId) {
      return NextResponse.json(
        { error: "Неправильний ID ресторану" },
        { status: 400 },
      );
    }

    const currentDate = new Date();
    const currentTime = format(currentDate, "HH:mm");

    const allTodayReservations = await db.reservation.findMany({
      where: {
        status: "active",
      },
      select: {
        id: true,
        tableId: true,
        date: true,
        startTime: true,
        endTime: true,
        table: {
          select: {
            restaurantId: true,
          },
        },
      },
    });

    const activeReservations = allTodayReservations.filter((res) => {
      if (res.table.restaurantId !== restaurantId) {
        return false;
      }

      let reservationDate;
      if (typeof res.date === "string") {
        reservationDate = res.date;
      } else {
        reservationDate = format(new Date(res.date), "yyyy-MM-dd");
      }

      const currentDateStr = format(currentDate, "yyyy-MM-dd");

      if (reservationDate !== currentDateStr) {
        return false;
      }

      return res.startTime <= currentTime && res.endTime > currentTime;
    });

    const tables = await db.table.findMany({
      where: { restaurantId },
    });

    const tableMap = new Map(tables.map((table) => [table.id, table]));
    const updatedTables = [];

    for (const reservation of activeReservations) {
      const table = tableMap.get(reservation.tableId);
      if (table && table.status !== "reserved") {
        const updatedTable = await db.table.update({
          where: { id: table.id },
          data: { status: "reserved" },
        });
        updatedTables.push(updatedTable);
      }
    }

    const tablesWithActiveReservations = new Set(
      activeReservations.map((r) => r.tableId),
    );

    for (const table of tables) {
      if (
        !tablesWithActiveReservations.has(table.id) &&
        table.status === "reserved"
      ) {
        const updatedTable = await db.table.update({
          where: { id: table.id },
          data: { status: "free" },
        });
        updatedTables.push(updatedTable);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Статус ${updatedTables.length} столиків оновлено`,
      updatedTables,
    });
  } catch (error) {
    console.error("Помилка при оновленні статусу столиків:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити статус столиків" },
      { status: 500 },
    );
  }
}
