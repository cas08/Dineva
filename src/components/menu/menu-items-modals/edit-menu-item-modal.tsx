"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { MenuItemsApi, PhotosApi } from "@/services";
import { MyButton, MyTextField } from "@/components/ui";
import toast from "react-hot-toast";
import Image from "next/image";
import { getErrorMessage } from "@/utils/error-utils";
import type { MenuItem, MenuItemFormData, PriceType } from "@/@types";
import { MenuItemSchema } from "@/zod-schemas";

interface EditMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedMenuItem: MenuItem) => void;
  initialData?: {
    id?: number;
    name: string;
    description?: string | null;
    price: PriceType;
    categoryId: number;
    photoUrl?: string | null;
  } | null;
  categories: { id: number; name: string }[];
}

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialData = null,
  categories,
}) => {
  const queryClient = useQueryClient();

  const [photo, setPhoto] = React.useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(MenuItemSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price ? Number(initialData.price.toString()) : 0,
      categoryId: initialData?.categoryId || categories[0]?.id || 0,
      photo: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price ? Number(initialData.price.toString()) : 0,
        categoryId: initialData?.categoryId || categories[0]?.id || 0,
        photo: undefined,
      });
      setPhoto(null);
    }
  }, [isOpen, initialData, reset, categories]);

  const mutation = useMutation<MenuItem, Error, MenuItemFormData>({
    mutationFn: async (data: MenuItemFormData): Promise<MenuItem> => {
      let photoUrl = initialData?.photoUrl || "";

      if (photo) {
        if (initialData?.photoUrl) {
          await PhotosApi.delete(initialData.photoUrl);
        }
        photoUrl = await PhotosApi.upload(photo);
      }

      const payload = {
        name: data.name,
        description: data.description || "",
        price: data.price,
        categoryId: data.categoryId,
        photoUrl: photoUrl,
      };

      if (initialData?.id) {
        const result = await MenuItemsApi.update({
          id: initialData.id,
          ...payload,
        });

        return {
          id: result.id,
          name: result.name,
          description: result.description || "",
          price: result.price,
          categoryId: result.categoryId,
          photoUrl: result.photoUrl,
        };
      } else {
        const result = await MenuItemsApi.create(payload);

        return {
          id: result.id,
          name: result.name,
          description: result.description || "",
          price: result.price,
          categoryId: result.categoryId,
          photoUrl: result.photoUrl,
        };
      }
    },
    onSuccess: async (updatedMenuItem) => {
      await queryClient.invalidateQueries({ queryKey: ["menuItems"] });

      onUpdate({
        id: initialData?.id ?? updatedMenuItem.id,
        name: updatedMenuItem.name,
        description: updatedMenuItem.description,
        price: updatedMenuItem.price,
        categoryId: updatedMenuItem.categoryId,
        photoUrl: updatedMenuItem.photoUrl,
      });

      onClose();
    },
  });

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      await toast.promise(
        mutation.mutateAsync(data),
        {
          loading: "Збереження пункту меню...",
          success: initialData
            ? "Пункт меню успішно оновлено!"
            : "Пункт меню успішно додано!",
          error: (err: Error) => {
            return getErrorMessage(err) || "Помилка при збереженні";
          },
        },
        {
          style: { pointerEvents: "none" },
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Редагувати пункт меню" : "Додати пункт меню"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="name"
              label="Назва *"
              control={control}
              sx={{ "& input": { placeholder: "Введіть назву" } }}
              disabled={mutation.isPending || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="description"
              label="Опис"
              control={control}
              sx={{ "& textarea": { placeholder: "Введіть опис" } }}
              disabled={mutation.isPending || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="price"
              label="Ціна *"
              type="number"
              control={control}
              sx={{ "& input": { placeholder: "Введіть ціну" } }}
              disabled={mutation.isPending || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <label className="block text-gray-700 mb-2">Категорія *</label>
            <select
              className="w-full p-2 border rounded-md"
              {...register("categoryId")}
              disabled={mutation.isPending || isSubmitting}
            >
              <option value="">Оберіть категорію</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-error text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <label className="block text-gray-700 mb-2">Фото</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) =>
                setPhoto(e.target.files ? e.target.files[0] : null)
              }
              className="w-full p-2 border rounded-md"
              disabled={mutation.isPending || isSubmitting}
            />
            {initialData?.photoUrl && (
              <div className="mt-2 w-32 h-32 relative">
                <Image
                  src={initialData.photoUrl}
                  alt="Поточне фото"
                  fill
                  sizes="128px"
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <MyButton
              customvariant="cancel"
              onClick={onClose}
              disabled={mutation.isPending || isSubmitting}
            >
              Скасувати
            </MyButton>
            <MyButton
              customvariant="confirm"
              type="submit"
              disabled={mutation.isPending || isSubmitting}
            >
              {mutation.isPending || isSubmitting
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

export { EditMenuItemModal };
