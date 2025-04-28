"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { CircularProgress } from "@mui/material";

export default function SessionRefreshPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Перевірка сесії...");

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session-check");

        if (!response.ok) {
          setStatus("Помилка перевірки сесії");
          setTimeout(() => {
            router.push("/sign-in");
          }, 2000);
          return;
        }

        const data = await response.json();

        if (data.needsRefresh) {
          setStatus("Необхідне оновлення сесії. Виконуємо вихід...");
          await signOut({ redirect: false });

          setTimeout(() => {
            router.push(
              `/sign-in?${data.reason === "expired" ? "session=expired" : "refresh=true"}`,
            );
          }, 1000);
        } else {
          setStatus("Сесія активна. Перенаправлення...");
          setTimeout(() => {
            router.push("/");
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setStatus("Сталася помилка. Перенаправлення на сторінку входу...");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    }

    checkSession();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CircularProgress
        size={60}
        style={{ marginBottom: 20, color: "var(--primary)" }}
      />
      <p className="text-xl">{status}</p>
    </div>
  );
}
