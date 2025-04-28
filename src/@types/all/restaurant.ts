import { z } from "zod";
import { RestaurantFormSchema } from "@/zod-schemas";

export type RestaurantFormData = z.infer<typeof RestaurantFormSchema>;
