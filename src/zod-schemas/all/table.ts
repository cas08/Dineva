import { z } from "zod";

export const TableFormSchema = z.object({
  tableNumber: z.coerce
    .number({ invalid_type_error: "Номер столика має бути числом" })
    .min(1, "Номер столика обов'язковий"),

  capacity: z.coerce
    .number({ invalid_type_error: "Місткість обов'язкова" })
    .min(1, "Місткість має бути більшою за 0"),

  status: z.enum(["free", "reserved", "occupied"]),
});

export const TableDbSchema = TableFormSchema.extend({
  restaurantId: z.number().min(1),
});
