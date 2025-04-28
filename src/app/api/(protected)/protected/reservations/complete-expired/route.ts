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
    const currentTime = currentDate.toTimeString().slice(0, 5); // HH:MM
    const formattedDateForDb = format(currentDate, "dd.MM.yyyy");

    const expiredReservations = await db.reservation.findMany({
      where: {
        status: "active",
        table: {
          restaurantId,
        },
        OR: [
          {
            date: {
              lt: formattedDateForDb,
            },
          },
          {
            date: formattedDateForDb,
            endTime: {
              lte: currentTime,
            },
          },
        ],
      },
    });

    const completedReservationIds = expiredReservations.map((r) => r.id);

    if (completedReservationIds.length > 0) {
      await db.reservation.updateMany({
        where: {
          id: {
            in: completedReservationIds,
          },
        },
        data: {
          status: "completed",
          completedAt: currentDate,
          isAutoCompleted: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${completedReservationIds.length} резервацій автоматично завершено`,
      completedCount: completedReservationIds.length,
    });
  } catch (error) {
    console.error("Помилка при автоматичному завершенні резервацій:", error);
    return NextResponse.json(
      { error: "Не вдалося автоматично завершити резервації" },
      { status: 500 },
    );
  }
}
