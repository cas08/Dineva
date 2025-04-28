import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { RestaurantDbSchema } from "@/zod-schemas";
import { isPrismaError } from "@/utils/error-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RestaurantDbSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const newRestaurant = await db.restaurant.create({ data: validation.data });
    return NextResponse.json(newRestaurant, { status: 201 });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Не вдалося створити ресторан" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { addressId } = body;

    if (!addressId || typeof addressId !== "number") {
      return NextResponse.json(
        { error: "addressId є обов'язковим і має бути числом" },
        { status: 400 },
      );
    }

    const restaurant = await db.restaurant.findFirst({
      where: { addressId },
      include: {
        tables: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Ресторан за цією адресою не знайдено" },
        { status: 404 },
      );
    }
    if (restaurant.tables && restaurant.tables.length > 0) {
      return NextResponse.json(
        {
          error:
            "Неможливо видалити ресторан, оскільки до нього прив'язані столики",
          code: "HAS_RELATED_TABLES",
        },
        { status: 409 },
      );
    }

    await db.restaurant.delete({
      where: { id: restaurant.id },
    });

    return NextResponse.json(
      { message: "Ресторан успішно видалено" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting restaurant:", error);

    if (
      isPrismaError(error) &&
      error.code === "P2003" &&
      error.meta?.field_name?.includes("restaurant_id")
    ) {
      return NextResponse.json(
        {
          error:
            "Неможливо видалити ресторан, оскільки до нього прив'язані столики",
          code: "HAS_RELATED_TABLES",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Не вдалося видалити ресторан" },
      { status: 500 },
    );
  }
}
