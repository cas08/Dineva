"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema } from "@/zod-schemas/all/auth";
import { useRouter } from "nextjs-toploader/app";
import { signIn, useSession, signOut } from "next-auth/react";
import { CircularProgress, Link, Paper, Alert } from "@mui/material";
import { toast } from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import type { SignInFormData } from "@/@types";
import { MyButton, MyTextField } from "../ui";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { useSearchParams } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
  });

  const [isGooglePopupOpen, setIsGooglePopupOpen] = useState(false);

  const handlePopupOpen = useCallback(() => {
    setIsGooglePopupOpen(true);
  }, []);

  const handlePopupClose = useCallback(() => {
    setIsGooglePopupOpen(false);
  }, []);

  useEffect(() => {
    const sessionExpired = searchParams.get("session") === "expired";
    const needRefresh = searchParams.get("refresh") === "true";

    if (sessionExpired || needRefresh) {
      if (status === "authenticated") {
        signOut({ redirect: false }).then(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("session");
          url.searchParams.delete("refresh");
          window.history.replaceState({}, "", url);
        });
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("session");
        url.searchParams.delete("refresh");
        window.history.replaceState({}, "", url);
      }

      if (sessionExpired) {
        setStatusMessage({
          type: "error",
          message: "Ваша сесія закінчилася. Будь ласка, увійдіть знову.",
        });
      }

      if (needRefresh) {
        setStatusMessage({
          type: "info",
          message:
            "Ваші права доступу змінилися. Увійдіть знову для застосування змін.",
        });
      }
    }
  }, [searchParams, status]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_SIGN_IN_SUCCESS") {
        toast.success("Вхід через Google успішний! Перенаправляємо...");
        setIsGooglePopupOpen(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        });
      }

      if (event.data.type === "GOOGLE_SIGN_IN_ERROR") {
        setIsGooglePopupOpen(false);
        toast.error(event.data.message || "Помилка входу через Google.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
      router.refresh();
    }
  }, [status, router]);

  const onSubmit = async (data: SignInFormData) => {
    await toast
      .promise(
        signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        }).then((response) => {
          if (response?.ok && !response?.error) {
            router.push("/profile");
            router.refresh();
            return Promise.resolve();
          }

          const errorMessage =
            response?.error === "CredentialsSignin"
              ? "Неправильний email або пароль"
              : response?.error || "Помилка входу";
          throw new Error(errorMessage);
        }),
        {
          loading: "Виконуємо вхід...",
          success: "Вхід успішний! Перенаправляємо...",
          error: (err) => err.message,
        },
        {
          style: { pointerEvents: "none" },
        },
      )
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="px-4 py-2">
      <Paper className="max-w-md p-8" elevation={12}>
        <h2 className="text-2xl font-bold text-center mb-6">
          Увійдіть до вашого акаунту
        </h2>

        {statusMessage && (
          <Alert
            severity={statusMessage.type}
            sx={{ mb: 3 }}
            variant="outlined"
          >
            {statusMessage.message}
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <MyTextField name="email" label="Email *" control={control} />
          <MyTextField
            name="password"
            label="Пароль *"
            type="password"
            control={control}
          />

          <MyButton
            customvariant="default"
            className="w-full"
            type="submit"
            disabled={isSubmitting || isGooglePopupOpen}
          >
            {isSubmitting ? "Вхід..." : "Увійти"}
          </MyButton>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative text-sm text-center text-gray-500 uppercase bg-white px-2 w-max mx-auto">
            Або продовжити через
          </div>
        </div>

        <GoogleSignIn
          onPopupOpenAction={handlePopupOpen}
          onPopupCloseAction={handlePopupClose}
        />

        <p className="text-center text-sm text-gray-600 mt-6 mb-2">
          Ще не маєте аккаунту?{" "}
          <Link className="text-blue-500 hover:underline" href="/sign-up">
            Зареєструватися
          </Link>
        </p>
      </Paper>

      {(isSubmitting || isGooglePopupOpen) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <CircularProgress style={{ color: "var(--neutral)" }} size="3rem" />
        </div>
      )}
    </div>
  );
}
