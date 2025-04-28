import * as z from "zod";
export const SignInSchema = z.object({
  email: z
    .string()
    .nonempty("Це поле обов'язкове")
    .email("Введіть коректний email"),

  password: z.string().nonempty("Це поле обов'язкове"),
});

export const SignUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ім'я обов'язкове та має містити мінімум 2 символ")
      .max(50, "Ім'я не може перевищувати 50 символів")
      .regex(
        /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'-]+$/,
        "Ім'я може містити тільки літери",
      ),
    surname: z
      .string()
      .max(50, "Прізвище не може перевищувати 50 символів")
      .regex(
        /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'-]+$/,
        "Прізвище може містити тільки літери",
      )
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .regex(/^\+380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX")
      .optional()
      .or(z.literal("+380")),
    email: z.string().min(1, "email обов'язковий").email("Неправильний email"),
    password: z
      .string()
      .min(1, "Пароль обов'язковий")
      .min(6, "Пароль має бути мінімум 6 символів")
      .max(50, "Пароль не може перевищувати 50 символів"),
    passwordRepeat: z.string().min(1, "Повторіть пароль"),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    path: ["passwordRepeat"],
    message: "Пароль відрізняється",
  });
