import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { checkAdminOrManager } from "@/utils/check-admin-manager";
import { formatDateToDDMMYYYY } from "@/utils/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { success, response } = await checkAdminOrManager();
    if (!success) return response;

    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { message: "ID бронювання не вказано" },
        { status: 400 },
      );
    }

    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Недійсний ID бронювання" },
        { status: 400 },
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
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
        user: {
          select: {
            email: true,
            name: true,
            surname: true,
          },
        },
        completedByUser: {
          select: {
            email: true,
            name: true,
            surname: true,
          },
        },
        cancelledByUser: {
          select: {
            email: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Бронювання не знайдено" },
        { status: 404 },
      );
    }

    const formattedReservation = {
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
      email: reservation.email || reservation.user?.email || "",
      userEmail: reservation.user?.email || "",
      createdBy: reservation.createdBy,
      userId: reservation.userId,
      createdAt: reservation.createdAt,
      completedAt: reservation.completedAt,
      completedById: reservation.completedById,
      completedByRole: reservation.completedByRole,

      completedByUser: reservation.completedByUser
        ? {
            name: reservation.completedByUser.name,
            surname: reservation.completedByUser.surname || undefined,
            email: reservation.completedByUser.email,
          }
        : null,

      cancelledAt: reservation.cancelledAt,
      cancelledById: reservation.cancelledById,
      cancelledByRole: reservation.cancelledByRole,

      cancelledByUser: reservation.cancelledByUser
        ? {
            name: reservation.cancelledByUser.name,
            surname: reservation.cancelledByUser.surname || undefined,
            email: reservation.cancelledByUser.email,
          }
        : null,
      isAutoCompleted: reservation.isAutoCompleted,
    };

    return NextResponse.json(formattedReservation);
  } catch (error) {
    console.error("Get reservation details error:", error);
    return NextResponse.json(
      { message: "Помилка при отриманні деталей бронювання" },
      { status: 500 },
    );
  }
}
