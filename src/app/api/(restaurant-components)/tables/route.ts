import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Потрібен restaurantId" },
        { status: 400 },
      );
    }

    const tables = await db.table.findMany({
      where: {
        restaurantId: Number(restaurantId),
      },
      orderBy: { tableNumber: "asc" },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { error: "Не вдалося отримати столики" },
      { status: 500 },
    );
  }
}
