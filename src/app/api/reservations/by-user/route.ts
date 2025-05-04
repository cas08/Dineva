import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import prisma from "@/lib/prisma-client";
import { z } from "zod";
import { ContactInfoDbSchema } from "@/zod-schemas";
import { getErrorMessage } from "@/utils/error-utils";
import { formatDateToDDMMYYYY } from "@/utils/date-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Неавторизований доступ" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const url = new URL(req.url);
    const showPast = url.searchParams.get("showPast") === "true";

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: userId,
        ...(showPast ? {} : { status: "active" }),
      },
      include: {
        table: {
          include: {
            restaurants: {
              include: {
                address: {
                  include: {
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      date: formatDateToDDMMYYYY(reservation.date),
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      status: reservation.status,
      peopleCount: reservation.peopleCount,
      tableNumber: reservation.table.tableNumber,
      tableId: reservation.tableId,
      restaurantAddress: `${reservation.table.restaurants.address.city.cityName}, ${reservation.table.restaurants.address.streetName} ${reservation.table.restaurants.address.buildingNumber}`,
      customerName: reservation.customerName,
      customerSurname: reservation.customerSurname,
      customerPhone: reservation.customerPhone,
      createdBy: reservation.createdBy,
      userId: reservation.userId,
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error("Get user reservations error:", error);
    return NextResponse.json(
      { message: "Помилка при отриманні бронювань" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Неавторизований доступ" },
        { status: 401 },
      );
    }

    const url = new URL(req.url);
    const reservationIdParam = url.searchParams.get("reservationId");

    const reservationId = parseInt(reservationIdParam || "", 10);

    if (isNaN(reservationId)) {
      return NextResponse.json(
        { success: false, message: "Неправильний ID бронювання" },
        { status: 400 },
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Бронювання не знайдено" },
        { status: 404 },
      );
    }

    if (reservation.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Ви не маєте прав для редагування цього бронювання",
        },
        { status: 403 },
      );
    }

    if (reservation.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Можна редагувати тільки активні бронювання",
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validatedData = ContactInfoDbSchema.parse(body);

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        customerName: validatedData.customerName,
        customerSurname: validatedData.customerSurname,
        customerPhone: validatedData.customerPhone,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Контактну інформацію успішно оновлено",
      reservation: {
        ...updatedReservation,
        date: formatDateToDDMMYYYY(updatedReservation.date),
      },
    });
  } catch (error) {
    console.error("Update reservation contact info error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Невірний формат даних" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          getErrorMessage(error) ||
          "Помилка при оновленні контактної інформації",
      },
      { status: 500 },
    );
  }
}
