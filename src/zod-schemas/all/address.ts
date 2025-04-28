import { z } from "zod";

export const AddressSchema = z.object({
  cityId: z.number({ required_error: "Місто обов’язкове" }),
  streetName: z
    .string()
    .min(1, "Назва вулиці обов'язкова")
    .max(150, "Максимум 150 символів"),
  buildingNumber: z
    .string()
    .min(1, "Номер будинку обов'язковий")
    .max(20, "Максимум 20 символів"),
});

export const AddressSchemaWithoutCity = AddressSchema.omit({ cityId: true });
