import db from "@/lib/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const restaurants = await db.restaurant.findMany({
      include: { address: { include: { city: true } } },
    });
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати ресторани" },
      { status: 500 },
    );
  }
}
