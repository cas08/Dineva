"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import toast from "react-hot-toast";
import { AddressesApi } from "@/services";
import { MyButton, MyTextField } from "@/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/utils/error-utils";
import { v4 as uuidv4 } from "uuid";
import type { AddressFormData } from "@/@types";
import { AddressSchemaWithoutCity } from "@/zod-schemas";

interface EditAddressModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUpdateAction: (updatedAddress: {
    id?: number | string;
    streetName: string;
    buildingNumber: string;
  }) => void;
  initialData?: {
    id?: number | string;
    streetName: string;
    buildingNumber: string;
  } | null;
}

export const EditAddressModal: React.FC<EditAddressModalProps> = ({
  isOpen,
  onCloseAction,
  onUpdateAction,
  initialData = null,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(AddressSchemaWithoutCity),
    defaultValues: {
      streetName: "",
      buildingNumber: "",
    },
  });

  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (isOpen) {
      reset({
        streetName: initialData?.streetName || "",
        buildingNumber: initialData?.buildingNumber || "",
      });
    }
  }, [isOpen, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (isEditing && typeof initialData?.id === "number") {
        return AddressesApi.update(initialData.id, data);
      } else {
        return Promise.resolve({ id: uuidv4(), ...data });
      }
    },
    onSuccess: async (result) => {
      toast.success(isEditing ? "Адресу оновлено!" : "Адресу додано!");
      onUpdateAction(result);
      onCloseAction();
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "Помилка при збереженні");
    },
  });

  const onSubmit = (data: AddressFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={onCloseAction} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Редагувати адресу" : "Додати адресу"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="streetName"
              label="Назва вулиці *"
              control={control}
              sx={{ "& input": { placeholder: "Введіть назву вулиці" } }}
              disabled={isSubmitting || mutation.isPending}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="buildingNumber"
              label="Номер будинку *"
              control={control}
              sx={{ "& input": { placeholder: "Введіть номер будинку" } }}
              disabled={isSubmitting || mutation.isPending}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <MyButton
            customvariant="cancel"
            onClick={onCloseAction}
            disabled={isSubmitting || mutation.isPending}
          >
            Скасувати
          </MyButton>
          <MyButton
            customvariant="confirm"
            type="submit"
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending
              ? "Збереження..."
              : isEditing
                ? "Оновити"
                : "Додати"}
          </MyButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
