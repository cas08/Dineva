import { z } from "zod";

export const changePasswordDbSchema = z.object({
  currentPassword: z.string().min(1, "Пароль не має бути порожнім"),
  newPassword: z.string().min(6, "Пароль має бути не менше 6 символів"),
  userId: z.string().min(1, "ID користувача обов'язкове"),
});

export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Пароль не має бути порожнім"),
    newPassword: z.string().min(6, "Пароль має бути не менше 6 символів"),
    confirmPassword: z.string().min(6, "Пароль має бути не менше 6 символів"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Новий пароль має відрізнятися від поточного",
    path: ["newPassword"],
  });

export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Ім'я обов'язкове").max(50).optional(),
  surname: z.string().max(50).nullable().optional(),
  phoneNumber: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val === "+380" || /^\+380\d{9}$/.test(val), {
      message: "Неправильний формат номера телефону",
    }),
});

export const DeleteAccountDbSchema = z.object({
  password: z.string().optional(),
  confirmation: z.string(),
  cancelFutureReservations: z.boolean().default(false),
});
