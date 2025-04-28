import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { checkAdminOrManager } from "@/utils/check-admin-manager";

export async function GET(req: NextRequest) {
  try {
    const { success, response } = await checkAdminOrManager();
    if (!success) return response;

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const showPast = url.searchParams.get("showPast") === "true";

    if (!userId) {
      return NextResponse.json(
        { message: "Необхідно вказати ID користувача" },
        { status: 400 },
      );
    }

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
      orderBy: {
        date: "asc",
      },
    });

    const formattedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      date: reservation.date,
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
