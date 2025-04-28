"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MyButton } from "@/components/ui";
import { CategoriesApi } from "@/services";
import { getErrorMessage } from "@/utils/error-utils";

interface DeleteCategoryModalProps {
  onClose: () => void;
  categoryId: number;
  categoryName: string;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  onClose,
  categoryId,
  categoryName,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => CategoriesApi.delete(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (error) => {
      console.error("Delete error:", error);
      setErrorMessage(getErrorMessage(error));
    },
  });

  const handleConfirm = async () => {
    if (isConfirmed) {
      setErrorMessage(null);
      try {
        await toast.promise(
          mutation.mutateAsync(),
          {
            loading: "Видалення категорії...",
            success: "Категорію видалено!",
            error: (err) => {
              console.log(err);
              if (err.response?.status === 400) {
                return "Не вдалося видалити категорію: можливо, вона використовується";
              }
              return err?.message || "Помилка при видаленні категорії";
            },
          },
          {
            style: { pointerEvents: "none" },
          },
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Видалення категорії</h2>
        <p className="text-gray-600 mb-4">
          Ви впевнені, що хочете видалити категорію &#34;<b>{categoryName}</b>
          &#34;? Цю дію не можна скасувати.
        </p>
        {errorMessage && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <p className="font-medium">Помилка</p>
            <p>{errorMessage}</p>
          </div>
        )}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mr-2 focus:ring-blue-500"
            disabled={mutation.isPending}
          />
          <label htmlFor="confirmDelete" className="text-sm text-gray-700">
            Я підтверджую видалення категорії.
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <MyButton
            customvariant="cancel"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Скасувати
          </MyButton>
          <MyButton
            customvariant="delete"
            onClick={handleConfirm}
            disabled={!isConfirmed || mutation.isPending}
          >
            {mutation.isPending ? "Видаляється..." : "Видалити"}
          </MyButton>
        </div>
      </div>
    </div>
  );
};

export { DeleteCategoryModal };
