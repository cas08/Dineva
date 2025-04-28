import { z } from "zod";
import { TableDbSchema, TableFormSchema } from "@/zod-schemas";

export type TableFormData = z.infer<typeof TableFormSchema>;
export type TableDbData = z.infer<typeof TableDbSchema>;
