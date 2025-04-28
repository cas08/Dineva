"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import { CategoriesApi } from "@/services";
import { MyButton, MyTextField } from "@/components/ui";
import { CategorySchema } from "@/zod-schemas";
import { getErrorMessage } from "@/utils/error-utils";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCategory: { id?: number; name: string }) => void;
  initialData?: { id?: number; name: string } | null;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialData = null,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { name: string; id?: number }) =>
      initialData?.id
        ? CategoriesApi.update(initialData.id, data.name)
        : CategoriesApi.create(data.name),
    onSuccess: async (updatedCategory) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      onUpdate({ id: initialData?.id, name: updatedCategory.name });
      onClose();
    },
    onError: (error) => {
      form.setError("name", {
        message: getErrorMessage(error) || "Помилка при збереженні",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof CategorySchema>) => {
    try {
      await toast.promise(
        mutation.mutateAsync({ name: data.name, id: initialData?.id }),
        {
          loading: isEditing
            ? "Оновлення категорії..."
            : "Додавання категорії...",
          success: isEditing ? "Категорію оновлено!" : "Категорію додано!",
          error: (err) => {
            console.log(err);
            if (err.response?.status === 400) {
              return "Категорія з такою назвою вже існує";
            }
            return err?.message || "Помилка при збереженні категорії";
          },
        },
        {
          style: { pointerEvents: "none" },
        },
      );
    } catch (err) {
      console.log(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Редагувати категорію" : "Додати категорію"}
        </h2>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="name"
              label="Назва категорії *"
              control={form.control}
              sx={{ "& input": { placeholder: "Введіть назву категорії" } }}
              disabled={mutation.isPending}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <MyButton
              customvariant="cancel"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Скасувати
            </MyButton>
            <MyButton
              customvariant="confirm"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Збереження..."
                : initialData
                  ? "Оновити"
                  : "Додати"}
            </MyButton>
          </Box>
        </form>
      </div>
    </div>
  );
};

export { EditCategoryModal };
