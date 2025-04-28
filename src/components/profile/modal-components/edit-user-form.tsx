"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { MyTextField, MyButton, PhoneInput } from "@/components/ui";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersApi } from "@/services";
import type { ProfileFormData } from "@/@types";
import { UpdateUserSchema } from "@/zod-schemas";

interface EditProfileFormProps {
  onCancelAction: () => void;
}

export function EditProfileForm({ onCancelAction }: EditProfileFormProps) {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();

  const defaultValues = useMemo(
    () => ({
      name: session?.user?.name || "",
      surname: session?.user?.surname || "",
      phoneNumber: session?.user?.phoneNumber || "",
    }),
    [session],
  );

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: UsersApi.updateProfile,
    onSuccess: async (updatedUser) => {
      await update({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      onCancelAction();
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    const cleanedData = {
      ...data,
      phoneNumber: data.phoneNumber === "+380" ? null : data.phoneNumber,
      name: data.name || "",
    };

    if (
      cleanedData.name === defaultValues.name &&
      (cleanedData.surname || "") === (defaultValues.surname || "") &&
      (cleanedData.phoneNumber || "") === (defaultValues.phoneNumber || "")
    ) {
      toast("Жодних змін не внесено", { icon: "ℹ️" });
      return;
    }

    await toast.promise(mutation.mutateAsync(cleanedData), {
      loading: "Оновлення профілю...",
      success: "Профіль оновлено!",
      error: (err) => err?.message || "Помилка при оновленні профілю",
    });
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
        Редагувати профіль
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container>
          <Grid size={12}>
            <MyTextField name="name" label="Імʼя *" control={control} />
          </Grid>
          <Grid size={12}>
            <MyTextField name="surname" label="Прізвище" control={control} />
          </Grid>
          <Grid size={12} mt={3}>
            <PhoneInput name="phoneNumber" control={control} />
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
                  "Зберегти"
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
