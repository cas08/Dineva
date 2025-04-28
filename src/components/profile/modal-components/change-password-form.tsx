"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { MyTextField, MyButton } from "@/components/ui";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { UsersApi } from "@/services";
import { useSession } from "next-auth/react";
import type { ChangePasswordFormData } from "@/@types";
import { ChangePasswordFormSchema } from "@/zod-schemas";

interface ChangePasswordFormProps {
  onCancelAction: () => void;
}

export function ChangePasswordForm({
  onCancelAction,
}: ChangePasswordFormProps) {
  const { data: session } = useSession();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setError,
    formState: { isDirty, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const watchNewPassword = watch("newPassword");
  const watchConfirmPassword = watch("confirmPassword");

  useEffect(() => {
    if (watchConfirmPassword) {
      trigger("confirmPassword");
    }
  }, [watchNewPassword, watchConfirmPassword, trigger]);

  const mutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!session?.user?.id) {
        throw new Error("Користувача не авторизовано");
      }

      return UsersApi.changePassword(
        currentPassword,
        newPassword,
        session.user.id,
      );
    },
    onSuccess: () => {
      onCancelAction();
    },
    onError: (error: Error) => {
      if (error.message === "Неправильний поточний пароль") {
        setError("currentPassword", {
          type: "manual",
          message: "Неправильний поточний пароль",
        });
      } else if (
        error.message === "Новий пароль має відрізнятися від поточного"
      ) {
        setError("newPassword", {
          type: "manual",
          message: "Новий пароль має відрізнятися від поточного",
        });
      }
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    await toast.promise(
      mutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
      {
        loading: "Зміна паролю...",
        success: "Пароль успішно змінено!",
        error: (err) => {
          if (
            err?.message === "Неправильний поточний пароль" ||
            err?.message === "Новий пароль має відрізнятися від поточного"
          ) {
            return null;
          }
          return err?.message || "Помилка при зміні паролю";
        },
      },
      {
        style: { pointerEvents: "none" },
      },
    );
  };

  const handleCancel = () => {
    if (isDirty) {
      toast("Зміни не збережено", { icon: "ℹ️" });
    }
    onCancelAction();
  };

  return (
    <Box position="relative">
      <Typography variant="h5" gutterBottom>
        Зміна паролю
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container>
          <Grid size={12}>
            <MyTextField
              name="currentPassword"
              label="Поточний пароль*"
              control={control}
              type="password"
            />
          </Grid>
          <Grid size={12}>
            <MyTextField
              name="newPassword"
              label="Новий пароль*"
              control={control}
              type="password"
            />
          </Grid>
          <Grid size={12}>
            <MyTextField
              name="confirmPassword"
              label="Підтвердження нового паролю*"
              control={control}
              type="password"
            />
          </Grid>
          <Grid size={12} mt={3}>
            <Box display="flex" gap={2}>
              <MyButton
                type="submit"
                customvariant="edit"
                disabled={!isValid || mutation.isPending}
              >
                {mutation.isPending ? (
                  <CircularProgress
                    style={{ color: "var(--primary)" }}
                    size={24}
                  />
                ) : (
                  "Змінити пароль"
                )}
              </MyButton>
              <MyButton
                customvariant="cancel"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Скасувати
              </MyButton>
            </Box>
          </Grid>
        </Grid>
      </form>

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
          zIndex={50}
        >
          <CircularProgress style={{ color: "var(--neutral)" }} size="3rem" />
        </Box>
      )}
    </Box>
  );
}
