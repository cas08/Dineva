import { z } from "zod";

export const ReservationSchema = z.object({
  tableId: z.number(),
  customerName: z
    .string()
    .min(1, "Ім'я обов'язкове")
    .max(50, "Ім'я не може бути довшим за 50 символів")
    .regex(/^[^0-9]*$/, "Ім'я не може містити цифри"),
  customerSurname: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .max(50, "Прізвище не може бути довшим за 50 символів")
    .regex(/^[^0-9]*$/, "Прізвище не може містити цифри"),
  customerPhone: z
    .string()
    .min(10, "Номер телефону має бути щонайменше 10 символів")
    .max(12, "Номер телефону не може бути довшим за 12 символів"),
  email: z
    .string()
    .email("Невалідна email-адреса")
    .max(150, "Email не може бути довшим за 150 символів")
    .optional()
    .nullable(),
  date: z.string().min(10, "Дата має бути в форматі YYYY-MM-DD"),
  startTime: z.string().min(5, "Час початку має бути в форматі HH:mm"),
  endTime: z.string().min(5, "Час закінчення має бути в форматі HH:mm"),
  userId: z.string().optional().nullable(),
  peopleCount: z.number().min(1, "Кількість осіб має бути щонайменше 1"),
});

const BaseContactSchema = z.object({
  customerName: z
    .string()
    .min(1, "Ім'я обов'язкове")
    .max(50, "Ім'я не може бути довшим за 50 символів")
    .regex(/^[^0-9]*$/, "Ім'я не може містити цифри"),
  customerSurname: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .max(50, "Прізвище не може бути довшим за 50 символів")
    .regex(/^[^0-9]*$/, "Прізвище не може містити цифри"),
  customerPhone: z.string(),
});

export const ContactInfoSchema = BaseContactSchema.extend({
  customerPhone: z
    .string()
    .min(13, "Неправильний номер")
    .regex(/^\+380\d{9}$/, "Введіть повний номер у форматі +380..."),
});

export const ContactInfoDbSchema = BaseContactSchema.extend({
  customerPhone: z
    .string()
    .regex(/^\d{10,12}$/, "Неправильний формат номера телефону"),
});
