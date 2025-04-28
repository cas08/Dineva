import db from "@/lib/prisma-client";
import { NextResponse } from "next/server";
import type { MenuItemWithCategory } from "@/@types";

export async function GET() {
  const menuItems = await db.menuItem.findMany({
    include: { category: true },
  });

  const groupedMenuItems = menuItems.reduce(
    (acc: Record<string, MenuItemWithCategory[]>, item) => {
      const categoryName = item.category?.name || "Без категорії";
      acc[categoryName] = acc[categoryName] || [];
      acc[categoryName].push({ ...item, categoryName });
      return acc;
    },
    {},
  );

  return NextResponse.json(
    Object.keys(groupedMenuItems).map((categoryName) => ({
      category: categoryName,
      items: groupedMenuItems[categoryName],
    })),
  );
}
