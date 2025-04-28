import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { AddressSchema } from "@/zod-schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = AddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const newAddress = await db.address.create({ data: validation.data });
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Не вдалося створити адресу" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID є обов'язковим" }, { status: 400 });
    }

    const validation = AddressSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const updatedAddress = await db.address.update({
      where: { id: body.id },
      data: validation.data,
    });

    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити адресу" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID є обов'язковим" }, { status: 400 });
    }

    await db.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Адресу видалено" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити адресу" },
      { status: 500 },
    );
  }
}
