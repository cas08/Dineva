import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, description, price, categoryId, photoUrl } = await req.json();
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Назва, ціна та id категорії є обов'язковими" },
        { status: 400 },
      );
    }
    const menuItem = await db.menuItem.create({
      data: {
        name,
        description,
        price,
        categoryId,
        photoUrl,
      },
    });
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Не вдалося створити елемент меню" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, description, price, categoryId, photoUrl } =
      await req.json();
    if (!id) {
      return NextResponse.json({ error: "id є обов'язковим" }, { status: 400 });
    }
    const updatedMenuItem = await db.menuItem.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price,
        categoryId,
        photoUrl,
      },
    });
    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити елемент меню" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id є обов'язковим" }, { status: 400 });
    }
    await db.menuItem.delete({
      where: { id },
    });
    return NextResponse.json(
      { message: "Елемент меню видалено" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити елемент меню" },
      { status: 500 },
    );
  }
}
