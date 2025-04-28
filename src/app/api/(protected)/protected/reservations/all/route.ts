import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { checkAdminOrManager } from "@/utils/check-admin-manager";
import { Prisma, ReservationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { success, response } = await checkAdminOrManager();
    if (!success) return response;

    const url = new URL(req.url);
    const showPast = url.searchParams.get("showPast") === "true";
    const status = url.searchParams.get("status");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const where: Prisma.ReservationWhereInput = {};

    if (status && status !== "all") {
      where.status = status as ReservationStatus;
    }

    if (!showPast) {
      const today = new Date()
        .toISOString()
        .split("T")[0]
        .split("-")
        .reverse()
        .join(".");
      where.date = { gte: today };
    }

    if (dateFrom || dateTo) {
      where.date = {
        ...(typeof where.date === "object" && where.date !== null
          ? where.date
          : {}),
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    const totalCount = await prisma.reservation.count({ where });

    const reservations = await prisma.reservation.findMany({
      where,
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
          },
        },
        completedByUser: {
          select: {
            email: true,
            name: true,
          },
        },
        cancelledByUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
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
      email: reservation.email || reservation.user?.email || "",
      userEmail: reservation.user?.email || "",
      createdBy: reservation.createdBy,
      userId: reservation.userId,
      createdAt: reservation.createdAt,
      completedAt: reservation.completedAt,
      completedBy: reservation.completedByUser
        ? `${reservation.completedByUser.name || ""} (${reservation.completedByUser.email})`
        : reservation.completedByRole,
      cancelledAt: reservation.cancelledAt,
      cancelledBy: reservation.cancelledByUser
        ? `${reservation.cancelledByUser.name || ""} (${reservation.cancelledByUser.email})`
        : reservation.cancelledByRole,
    }));

    return NextResponse.json({
      reservations: formattedReservations,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get all reservations error:", error);
    return NextResponse.json(
      { message: "Помилка при отриманні бронювань" },
      { status: 500 },
    );
  }
}
