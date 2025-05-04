import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma-client";
import {
  generateTimeSlots,
  calculateEndTime,
  isSlotWithinWorkingHours,
  RESTAURANT_CLOSE_HOUR,
} from "@/utils/reservation-utils";
import type { TimeSlotAvailability } from "@/@types";
import { parseDateString, timeToMinutes } from "@/utils/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const dateString = searchParams.get("date");
    const peopleCount = searchParams.get("peopleCount");
    const duration = searchParams.get("duration");

    if (!restaurantId || !dateString || !peopleCount || !duration) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const date = parseDateString(dateString);

    const tables = await db.table.findMany({
      where: {
        restaurantId: parseInt(restaurantId),
      },
    });

    if (tables.length === 0) {
      return NextResponse.json([]);
    }

    const reservations = await db.reservation.findMany({
      where: {
        date,
        status: "active",
        table: {
          restaurantId: parseInt(restaurantId),
        },
      },
      select: {
        tableId: true,
        startTime: true,
        endTime: true,
      },
    });

    const timeSlots = generateTimeSlots();
    const parsedPeopleCount = parseInt(peopleCount);

    const availability: TimeSlotAvailability[] = timeSlots.map((time) => {
      if (!isSlotWithinWorkingHours(time, duration, RESTAURANT_CLOSE_HOUR)) {
        return { time, available: false, availableTables: [] };
      }
      const endTime = calculateEndTime(time, duration);

      const availableTables = tables.filter((table) => {
        if (
          table.capacity < parsedPeopleCount ||
          table.capacity > parsedPeopleCount + 2
        ) {
          return false;
        }

        const hasOverlap = reservations.some((reservation) => {
          if (reservation.tableId !== table.id) {
            return false;
          }

          const resStart = timeToMinutes(reservation.startTime);
          const resEnd = timeToMinutes(reservation.endTime);
          const slotStart = timeToMinutes(time);
          const slotEnd = timeToMinutes(endTime);

          return slotStart < resEnd && slotEnd > resStart;
        });

        return !hasOverlap;
      });

      return {
        time,
        available: availableTables.length > 0,
        availableTables: availableTables.map((t) => t.id),
      };
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error getting available slots:", error);
    return NextResponse.json(
      { error: "Failed to get available time slots" },
      { status: 500 },
    );
  }
}
