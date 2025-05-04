import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { checkAdminOrManager } from "@/utils/check-admin-manager";
import { auth } from "@/lib/auth-options";
import { UserRole } from "@/@types";
import { Prisma } from "@prisma/client";
import { formatDateToDDMMYYYY, parseDateString } from "@/utils/date-utils";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const dateParam = searchParams.get("date");
    const tableId = searchParams.get("tableId");

    if (!restaurantId || !dateParam) {
      return NextResponse.json(
        { error: "ID ресторану та дата є обов'язковими" },
        { status: 400 },
      );
    }

    const date = parseDateString(dateParam);

    const whereCondition: Prisma.ReservationWhereInput = {
      date,
      table: {
        restaurantId: parseInt(restaurantId, 10),
      },
    };

    if (tableId) {
      whereCondition.tableId = parseInt(tableId, 10);
    }

    const reservations = await prisma.reservation.findMany({
      where: whereCondition,
      select: {
        id: true,
        tableId: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        peopleCount: true,
        customerName: true,
        customerSurname: true,
        customerPhone: true,
        table: {
          select: {
            tableNumber: true,
            capacity: true,
          },
        },
      },
      orderBy: [{ tableId: "asc" }, { startTime: "asc" }],
    });
    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      date: formatDateToDDMMYYYY(reservation.date),
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error("Помилка отримання резервацій:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати резервації" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    const { success, response } = await checkAdminOrManager();
    if (!success) return response;

    const url = new URL(req.url);
    const reservationId = url.searchParams.get("reservationId");
    const action = url.searchParams.get("action");

    if (!reservationId) {
      return NextResponse.json(
        { message: "Необхідно вказати ID бронювання" },
        { status: 400 },
      );
    }

    if (!action || !["cancel", "complete"].includes(action)) {
      return NextResponse.json(
        { message: "Необхідно вказати коректну дію (cancel або complete)" },
        { status: 400 },
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(reservationId) },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Бронювання не знайдено" },
        { status: 404 },
      );
    }

    if (reservation.status !== "active") {
      const actionVerb = action === "cancel" ? "скасувати" : "завершити";
      return NextResponse.json(
        {
          message: `${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} можна лише активні бронювання`,
        },
        { status: 400 },
      );
    }

    const newStatus = action === "cancel" ? "cancelled" : "completed";

    const updateData: Prisma.ReservationUpdateInput = {
      status: newStatus,
    };

    if (action === "cancel") {
      updateData.cancelledAt = new Date();
      updateData.cancelledByRole = userRole as UserRole;

      if (userId) {
        updateData.cancelledByUser = {
          connect: { id: userId },
        };
      } else {
        updateData.cancelledByUser = undefined;
      }
    } else {
      updateData.completedAt = new Date();
      updateData.completedByRole = userRole as UserRole;

      if (userId) {
        updateData.completedByUser = {
          connect: { id: userId },
        };
      } else {
        updateData.completedByUser = undefined;
      }
    }

    await prisma.reservation.update({
      where: { id: parseInt(reservationId) },
      data: updateData,
    });

    const actionVerb = action === "cancel" ? "скасовано" : "завершено";

    return NextResponse.json({
      success: true,
      message: `Бронювання успішно ${actionVerb}`,
    });
  } catch (error) {
    console.error(
      `Reservation ${req.url.includes("action=cancel") ? "cancellation" : "completion"} error:`,
      error,
    );
    const actionType = req.url.includes("action=cancel")
      ? "скасуванні"
      : "завершенні";

    return NextResponse.json(
      { message: `Помилка при ${actionType} бронювання`, success: false },
      { status: 500 },
    );
  }
}
