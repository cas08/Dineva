"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function GooglePopupSignInPage() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isSignInInitiated, setIsSignInInitiated] = useState(false);

  useEffect(() => {
    if (error) {
      window.opener?.postMessage(
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
      return;
    }

    if (status === "unauthenticated" && !isSignInInitiated) {
      setIsSignInInitiated(true);
      void signIn("google", { redirect: true });
    }

    if (status === "authenticated") {
      window.opener?.postMessage(
        { type: "GOOGLE_SIGN_IN_SUCCESS" },
        window.location.origin,
      );
      window.close();
    }
  }, [status, error, isSignInInitiated]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Авторизація через Google...</p>
    </div>
  );
}
