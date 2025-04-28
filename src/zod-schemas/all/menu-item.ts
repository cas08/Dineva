import { z } from "zod";

export const MenuItemSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова").max(50, "Максимум 50 символів"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => {
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? undefined : parsed;
    },
    z
      .number({ required_error: "Ціна обов'язкова" })
      .min(0.01, "Ціна має бути більше 0.01"),
  ),
  categoryId: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Категорія обов'язкова"),
  ),
  photo: z.instanceof(File).optional(),
});
