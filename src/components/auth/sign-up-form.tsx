"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "@/zod-schemas/all/auth";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "react-hot-toast";
import { CircularProgress, Link, Paper } from "@mui/material";
import type { SignUpFormData } from "@/@types";
import { MyButton, MyTextField, PhoneInput } from "../ui";
import { AuthApi } from "@/services";

export function SignUpForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    if (data.phoneNumber === "+380") {
      data.phoneNumber = undefined;
    }

    await toast
      .promise(
        AuthApi.userSignUp(data)
          .then((response) => {
            router.push("/sign-in");
            return response;
          })
          .catch((error) => {
            if (error.message === "Цей email вже використовується") {
              setError("email", {
                type: "manual",
                message: "Цей email вже використовується",
              });
            }
            throw error;
          }),
        {
          loading: "Виконуємо реєстрацію...",
          success: "Реєстрація успішна! Перенаправляємо...",
          error: (err) => err.message,
        },
        {
          style: { pointerEvents: "none" },
        },
      )
      .catch((err) => {
        console.error("Registration error:", err);
      });
  };

  return (
    <div className="px-4 py-2 my-3">
      <Paper className="max-w-md p-8" elevation={12}>
        <h2 className="text-2xl font-bold text-center mb-6">
          Створіть новий акаунт
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <MyTextField name="name" label="Ім'я *" control={control} />
          <MyTextField name="surname" label="Прізвище" control={control} />
          <MyTextField name="email" label="Email *" control={control} />

          <PhoneInput name="phoneNumber" control={control} />

          <MyTextField
            name="password"
            label="Пароль *"
            type="password"
            control={control}
          />
          <MyTextField
            name="passwordRepeat"
            label="Підтвердити пароль *"
            type="password"
            control={control}
          />

          <MyButton
            customvariant="default"
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
          </MyButton>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 mb-2">
          Вже маєте аккаунт? &nbsp;
          <Link className="text-blue-500 hover:underline" href="/sign-in">
            Увійти
          </Link>
        </p>
      </Paper>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <CircularProgress style={{ color: "var(--neutral)" }} size="3rem" />
        </div>
      )}
    </div>
  );
}
