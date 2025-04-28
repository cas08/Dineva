import { z } from "zod";

export const CategorySchema = z.object({
  name: z
    .string()
    .min(1, "Назва категорії обов’язкова")
    .max(50, "Максимум 50 символів"),
});

export const CategoryUpdateSchema = CategorySchema.extend({
  id: z.number({ required_error: "ID обов’язковий" }),
});
