import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { CityDbSchema } from "@/zod-schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CityDbSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const { cityName } = validation.data;
    const city = await db.city.create({
      data: { cityName },
    });

    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json(
      { error: "Не вдалося створити місто" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id обов'язковий" }, { status: 400 });
    }

    const validation = CityDbSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const { cityName } = validation.data;
    const city = await db.city.update({
      where: { id: body.id },
      data: { cityName },
    });

    return NextResponse.json(city);
  } catch (error) {
    console.error("Error updating city:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити місто" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id обов'язковий" }, { status: 400 });
    }

    await db.city.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Місто видалено" });
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити місто" },
      { status: 500 },
    );
  }
}
