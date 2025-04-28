"use client";

import { FcGoogle } from "react-icons/fc";
import { useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

type GoogleSignInProps = {
  onPopupOpenAction: () => void;
  onPopupCloseAction: () => void;
  disabled?: boolean;
};

export function GoogleSignIn({
  onPopupOpenAction,
  onPopupCloseAction,
  disabled,
}: GoogleSignInProps) {
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorReceivedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data.type === "GOOGLE_SIGN_IN_ERROR" ||
        event.data.type === "GOOGLE_SIGN_IN_SUCCESS"
      ) {
        errorReceivedRef.current = true;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handlePopupClosed = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    popupRef.current = null;
    onPopupCloseAction();

    if (!errorReceivedRef.current) {
      toast.error("Авторизацію через Google перервано. Спробуйте ще раз.");
    }

    errorReceivedRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  const openPopup = () => {
    errorReceivedRef.current = false;

    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;
    const screenWidth =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
    const screenHeight =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;
    const systemZoom = screenWidth / window.screen.availWidth;

    const popupWidth = 500;
    const popupHeight = 600;

    const left = (screenWidth - popupWidth) / 2 / systemZoom + dualScreenLeft;
    const top = (screenHeight - popupHeight) / 2 / systemZoom + dualScreenTop;

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    const newPopup = window.open(
      "/google-sign-in",
      "GoogleSignInPopup",
      `width=${popupWidth / systemZoom},height=${popupHeight / systemZoom},top=${top},left=${left},resizable=yes,scrollbars=yes`,
    );

    if (newPopup) {
      popupRef.current = newPopup;
      onPopupOpenAction();
      newPopup.focus();

      const maxAuthTime = setTimeout(() => {
        if (popupRef.current && !popupRef.current.closed) {
          if (!errorReceivedRef.current) {
            toast.error("Час авторизації вичерпано. Спробуйте ще раз.");
          }
          popupRef.current.close();
          onPopupCloseAction();
        }

        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }, 120000); // 2 minutes

      checkIntervalRef.current = setInterval(() => {
        if (!popupRef.current || popupRef.current.closed) {
          clearTimeout(maxAuthTime);

          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }

          handlePopupClosed();
        }
      }, 500);
    } else {
      toast.error(
        "Не вдалося відкрити вікно авторизації. Перевірте налаштування браузера.",
      );
    }
  };

  return (
    <button
      onClick={openPopup}
      className="flex items-center justify-center border py-2 rounded-md shadow-sm hover:bg-gray-50 w-full"
      disabled={disabled}
    >
      <FcGoogle className="text-xl mr-2" />
      Google
    </button>
  );
}
