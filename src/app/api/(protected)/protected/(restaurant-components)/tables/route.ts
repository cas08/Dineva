import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { TableDbSchema } from "@/zod-schemas";
import { isPrismaError } from "@/utils/error-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = TableDbSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const duplicate = await db.table.findFirst({
      where: {
        tableNumber: validation.data.tableNumber,
        restaurantId: validation.data.restaurantId,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "У цьому ресторані вже є столик з таким номером" },
        { status: 400 },
      );
    }

    const newTable = await db.table.create({ data: validation.data });
    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error("Error:", error);

    if (isPrismaError(error) && error.code === "P2002") {
      return NextResponse.json(
        { error: "У цьому ресторані вже існує столик з таким номером" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не вдалося створити столик" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tableIdParam = req.nextUrl.searchParams.get("tableId");
    if (!tableIdParam) {
      return NextResponse.json(
        { error: "Потрібен параметр tableId" },
        { status: 400 },
      );
    }

    const tableId = parseInt(tableIdParam);
    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: "Некоректний tableId" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validation = TableDbSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const data = validation.data;

    const duplicate = await db.table.findFirst({
      where: {
        tableNumber: data.tableNumber,
        restaurantId: data.restaurantId,
        NOT: {
          id: tableId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "У цьому ресторані вже є столик з таким номером" },
        { status: 400 },
      );
    }

    const updatedTable = await db.table.update({
      where: { id: tableId },
      data,
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Помилка при оновленні столика:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити столик" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tableIdParam = req.nextUrl.searchParams.get("tableId");

    if (!tableIdParam) {
      return NextResponse.json(
        { error: "Потрібен параметр tableId" },
        { status: 400 },
      );
    }

    const tableId = parseInt(tableIdParam);
    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: "Некоректний tableId" },
        { status: 400 },
      );
    }

    await db.table.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Помилка при видаленні столика:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити столик" },
      { status: 500 },
    );
  }
}
