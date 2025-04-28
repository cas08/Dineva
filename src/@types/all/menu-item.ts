import * as z from "zod";
import { MenuItemSchema } from "@/zod-schemas";
import type { MenuItemPrisma } from "@/@types";

export type MenuItemWithCategory = MenuItemPrisma & { categoryName: string };

export type GroupedMenuItems = {
  category: string;
  items: MenuItemWithCategory[];
};
export type MenuItemFormData = z.infer<typeof MenuItemSchema>;

export type PriceType = number | { toString: () => string };

export type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: PriceType;
  categoryId: number;
  photoUrl?: string;
};
