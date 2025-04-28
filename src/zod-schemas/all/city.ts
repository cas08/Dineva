import { z } from "zod";

export const CitySchema = z.object({
  name: z
    .string()
    .min(1, "Назва міста обов'язкова")
    .max(100, "Максимум 100 символів"),
});
export const CityDbSchema = z.object({
  cityName: CitySchema.shape.name,
});
