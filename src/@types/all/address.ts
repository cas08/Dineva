import { z } from "zod";
import { AddressSchema, AddressSchemaWithoutCity } from "@/zod-schemas";

export type AddressFormData = z.infer<typeof AddressSchemaWithoutCity>;
export type FullAddressFormData = z.infer<typeof AddressSchema>;

export type AddressOption = {
  value: number | string;
  label: string;
  cityId: number;
};
