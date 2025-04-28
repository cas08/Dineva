import { z } from "zod";

export const ReviewFormSchema = z.object({
  id: z.number().optional(),
  rating: z
    .number()
    .min(1, "Рейтинг обов'язковий і має бути від 1 до 5")
    .max(5, "Рейтинг не може перевищувати 5"),
  comment: z.string().optional().nullable(),
});

export const ReviewDbSchema = z.object({
  userId: z.string().min(1, "userId є обов'язковим"),
  rating: z
    .number()
    .min(1, "Рейтинг має бути мінімум 1")
    .max(5, "Рейтинг має бути максимум 5"),
  comment: z.string().optional(),
});
