import { z } from "zod";

export const RestaurantDbSchema = z.object({
  addressId: z.number().min(1),
});

export const RestaurantFormSchema = z.object({
  cityId: z.union([
    z.string().min(1, "Виберіть місто"),
    z.number().positive("Виберіть місто"),
  ]),
  streetName: z.string().min(1, "Введіть назву вулиці"),
  buildingNumber: z.string().min(1, "Введіть номер будинку"),
  newCityName: z.string().optional(),
});
