import db from "@/lib/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cities = await db.city.findMany();
    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати міста" },
      { status: 500 },
    );
  }
}
