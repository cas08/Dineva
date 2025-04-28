import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { CategorySchema, CategoryUpdateSchema } from "@/zod-schemas";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = CategorySchema.parse(body);

    const existingCategory = await db.category.findUnique({
      where: { name },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Категорія з таким іменем вже існує" },
        { status: 409 },
      );
    }

    const category = await db.category.create({
      data: { name },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Не вдалось створити категорію" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name } = CategoryUpdateSchema.parse(body);

    const updatedCategory = await db.category.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Update category error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Помилка валідації" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не вдалось оновити категорію" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id обов'язкове" }, { status: 400 });
    }

    const menuItemsCount = await db.menuItem.count({
      where: { categoryId: id },
    });

    if (menuItemsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Категорія містить пункти меню. Видаліть або перемістіть їх перед видаленням категорії.",
        },
        { status: 400 },
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Категорію видалено" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Не вдалось видалити категорію" },
      { status: 500 },
    );
  }
}
