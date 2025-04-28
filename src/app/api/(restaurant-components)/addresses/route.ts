import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const cityIdParam = searchParams.get("cityId");

    const addresses = await db.address.findMany({
      where: cityIdParam ? { cityId: Number(cityIdParam) } : undefined,
      include: { city: true },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати адреси" },
      { status: 500 },
    );
  }
}
