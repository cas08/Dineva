import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma-client";
import { ReservationSchema } from "@/zod-schemas";
import { auth } from "@/lib/auth-options";
import type { ReservationCreator, UserRole } from "@/@types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const date = searchParams.get("date");

    if (!restaurantId || !date) {
      return NextResponse.json(
        { error: "ID ресторану та дата є обов'язковими" },
        { status: 400 },
      );
    }

    const reservations = await db.reservation.findMany({
      where: {
        date,
        status: "active",
        table: {
          restaurantId: parseInt(restaurantId, 10),
        },
      },
      select: {
        id: true,
        tableId: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        peopleCount: true,
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Помилка отримання резервацій:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати резервації" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const userId = session?.user?.id || null;

    const body = await req.json();
    const normalizedData = {
      ...body,
      email: body.email || session?.user?.email || null,
      userId: userId,
    };

    const data = ReservationSchema.parse(normalizedData);

    const existing = await db.reservation.findMany({
      where: {
        tableId: data.tableId,
        date: data.date,
        status: "active",
      },
      select: { startTime: true, endTime: true },
    });

    const isConflict = existing.some((r) => {
      return (
        (data.startTime >= r.startTime && data.startTime < r.endTime) ||
        (data.endTime > r.startTime && data.endTime <= r.endTime) ||
        (data.startTime <= r.startTime && data.endTime >= r.endTime)
      );
    });

    if (isConflict) {
      return NextResponse.json(
        { error: "Цей столик вже зарезервовано на вибраний час." },
        { status: 409 },
      );
    }

    let createdBy = "Guest";

    if (userId && session?.user.role) {
      createdBy = session?.user.role;
    }

    const reservation = await db.reservation.create({
      data: {
        tableId: data.tableId,
        customerName: data.customerName,
        customerSurname: data.customerSurname,
        customerPhone: data.customerPhone,
        email: data.email,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        userId: userId,
        peopleCount: data.peopleCount,
        status: "active",
        createdBy: createdBy as ReservationCreator,
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Помилка створення резервації:", error);
    return NextResponse.json(
      { error: "Не вдалося створити резервацію" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    const { searchParams } = new URL(req.url);
    const reservationIdParam = searchParams.get("reservationId");

    if (!reservationIdParam) {
      return NextResponse.json(
        { success: false, message: "Не вказано ID резервації" },
        { status: 400 },
      );
    }

    const reservationId = parseInt(reservationIdParam, 10);

    if (isNaN(reservationId)) {
      return NextResponse.json(
        { success: false, message: "Неправильний ID резервації" },
        { status: 400 },
      );
    }

    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Резервацію не знайдено" },
        { status: 404 },
      );
    }

    if (userId && reservation.userId && userId !== reservation.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "У вас немає прав для редагування цієї резервації",
        },
        { status: 403 },
      );
    }

    if (reservation.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Скасувати можна лише активні резервації" },
        { status: 400 },
      );
    }

    await db.reservation.update({
      where: { id: reservationId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledById: userId || null,
        cancelledByRole: userRole as UserRole,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Резервацію успішно скасовано",
    });
  } catch (error) {
    console.error("Помилка скасування резервації:", error);
    return NextResponse.json(
      { success: false, message: "Не вдалося скасувати резервацію" },
      { status: 500 },
    );
  }
}
