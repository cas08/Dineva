import { z } from "zod";
import { ChangePasswordFormSchema, UpdateUserSchema } from "@/zod-schemas";
export type ProfileUpdateData = {
  name: string;
  surname?: string | null;
  phoneNumber?: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  phoneNumber: string | null;
};

export type ChangePasswordFormData = z.infer<typeof ChangePasswordFormSchema>;
export type ProfileFormData = z.infer<typeof UpdateUserSchema>;

export type UserInfo = {
  name: string;
  surname?: string;
  email: string;
};
