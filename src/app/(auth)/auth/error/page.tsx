"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "GOOGLE_SIGN_IN_ERROR",
          message:
            error === "EmailPasswordAccount"
              ? "Цей акаунт вже зареєстрований через email і пароль. Будь ласка, увійдіть вручну."
              : "Помилка входу через Google.",
        },
        window.location.origin,
      );
      window.close();
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-red-600 text-lg mb-4">Помилка авторизації</p>
      <p className="text-gray-600">
        {error === "EmailPasswordAccount"
          ? "Цей акаунт вже зареєстрований через email і пароль. Будь ласка, увійдіть вручну."
          : "Помилка входу через Google."}
      </p>
      <button
        onClick={() => window.close()}
        className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Закрити
      </button>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress style={{ color: "var(--primary)" }} />
        </Box>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
