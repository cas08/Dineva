"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";
import { MyTextField, MyButton } from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { UsersApi } from "@/services";

interface DeleteAccountDialogProps {
  open: boolean;
  onCloseAction: () => void;
}

export function DeleteAccountDialog({
  open,
  onCloseAction,
}: DeleteAccountDialogProps) {
  const { data: session } = useSession();
  const hasPassword = session?.user?.hasPassword ?? false;
  const [cancelReservations, setCancelReservations] = useState(false);

  const deleteAccountSchema = z
    .object({
      password: z.string().optional(),
      confirmation: z.string().optional(),
      hasPassword: z.literal(hasPassword),
    })
    .refine(
      (data) =>
        data.hasPassword ? data.password && data.password.length > 0 : true,
      {
        message: "Пароль обов'язковий",
        path: ["password"],
      },
    )
    .refine(
      (data) => (!data.hasPassword ? data.confirmation === "ВИДАЛИТИ" : true),
      {
        message: "Будь ласка, введіть слово 'ВИДАЛИТИ'",
        path: ["confirmation"],
      },
    );

  type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid },
    reset,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "",
      hasPassword,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({
        password: "",
        confirmation: "",
        hasPassword,
      });
      setCancelReservations(false);
    }
  }, [open, reset, hasPassword]);

  const mutation = useMutation({
    mutationFn: ({
      password,
      confirmation,
      cancelFutureReservations,
    }: {
      password?: string;
      confirmation?: string;
      cancelFutureReservations: boolean;
    }) =>
      UsersApi.deleteAccount(
        password ?? "",
        cancelFutureReservations,
        confirmation ?? "",
      ),
    onSuccess: async () => {
      toast.success("Акаунт успішно видалено");
      reset();
      onCloseAction();
      await signOut({ callbackUrl: "/" });
    },
    onError: (error: Error) => {
      if (error.message === "Неправильний пароль") {
        setError("password", {
          type: "manual",
          message: "Неправильний пароль",
        });
        toast.error("Неправильний пароль");
      } else if (error.message === "Невірне підтвердження") {
        setError("confirmation", {
          type: "manual",
          message: "Будь ласка, введіть слово 'ВИДАЛИТИ'",
        });
        toast.error("Будь ласка, введіть слово 'ВИДАЛИТИ'");
      } else {
        toast.error(error.message || "Помилка видалення акаунту");
      }
    },
  });

  const onSubmit = async (data: DeleteAccountFormData) => {
    try {
      await mutation.mutateAsync({
        password: hasPassword ? data.password : undefined,
        confirmation: hasPassword ? "ВИДАЛИТИ" : data.confirmation,
        cancelFutureReservations: cancelReservations,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      reset();
      onCloseAction();
    }
  };

  return (
    <Box position="relative">
      <Dialog
        open={open}
        onClose={!mutation.isPending ? handleClose : undefined}
        sx={{ zIndex: 1200 }}
      >
        <DialogTitle>Видалення акаунту</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <DialogContentText color="error">
              Увага! Видалення акаунту є незворотньою дією. Всі ваші дані будуть
              видалені назавжди.
            </DialogContentText>

            {hasPassword ? (
              <Box mt={3}>
                <MyTextField
                  name="password"
                  label="Введіть пароль для підтвердження*"
                  control={control}
                  type="password"
                />
              </Box>
            ) : (
              <Box mt={3}>
                <MyTextField
                  name="confirmation"
                  label="Для підтвердження введіть слово 'ВИДАЛИТИ' *"
                  control={control}
                />
              </Box>
            )}

            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cancelReservations}
                    onChange={(e) => setCancelReservations(e.target.checked)}
                    style={{ color: "var(--primary)" }}
                  />
                }
                label="Скасувати всі мої майбутні бронювання"
              />
            </Box>

            <DialogContentText sx={{ mt: 2, fontSize: "0.875rem" }}>
              {cancelReservations
                ? "При видаленні акаунту всі ваші майбутні бронювання будуть скасовані."
                : "При видаленні акаунту інформація про користувача буде видалена з ваших бронювань, але самі бронювання залишаться активними."}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <MyButton
              customvariant="cancel"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Скасувати
            </MyButton>
            <MyButton
              type="submit"
              customvariant="delete"
              disabled={!isValid || mutation.isPending}
            >
              {mutation.isPending ? (
                <CircularProgress
                  style={{ color: "var(--primary)" }}
                  size={24}
                />
              ) : (
                "Видалити акаунт"
              )}
            </MyButton>
          </DialogActions>
        </form>
      </Dialog>

      {mutation.isPending && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1300}
        >
          <CircularProgress style={{ color: "var(--neutral)" }} size="3rem" />
        </Box>
      )}
    </Box>
  );
}
