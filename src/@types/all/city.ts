import { z } from "zod";
import { CitySchema } from "@/zod-schemas";

export type CityOption = {
  value: number | string;
  label: string;
};

export type CityFormData = z.infer<typeof CitySchema>;
