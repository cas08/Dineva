import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma-client";
import { startOfDay } from "date-fns";
import { timeToMinutes } from "@/utils/date-utils";

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
    const currentDay = startOfDay(currentDate);

    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const activeReservations = await db.reservation.findMany({
      where: {
        status: "active",
        table: {
          restaurantId,
        },
      },
      include: {
        table: true,
      },
    });

    console.log(`Знайдено активних резервацій: ${activeReservations.length}`);

    const expiredReservations = activeReservations.filter((res) => {
      const reservationDate = new Date(res.date);
      if (reservationDate < currentDay) {
        console.log(`Резервація ${res.id}: минула дата (${res.date})`);
        return true;
      }

      const resDateStr = reservationDate.toISOString().split("T")[0];
      const currDateStr = currentDate.toISOString().split("T")[0];

      if (resDateStr === currDateStr) {
        if (!res.endTime) {
          console.log(`Резервація ${res.id}: відсутній час закінчення`);
          return false;
        }

        const endTimeInMinutes = timeToMinutes(res.endTime);
        return endTimeInMinutes <= currentTimeInMinutes;
      }

      return false;
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
    } else {
      console.log("Немає резервацій для завершення");
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
