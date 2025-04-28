"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MyButton } from "@/components/ui";
import { MenuItemsApi } from "@/services";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/error-utils";

interface DeleteMenuItemModalProps {
  onClose: () => void;
  menuItemId: number;
  menuItemName: string;
  categoryName: string;
  onDeleteSuccess?: () => void;
}

const DeleteMenuItemModal: React.FC<DeleteMenuItemModalProps> = ({
  onClose,
  menuItemId,
  menuItemName,
  categoryName,
  onDeleteSuccess,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => MenuItemsApi.delete(menuItemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menuItems"] });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        onClose();
      }
    },
    onError: (error) => {
      console.error("Delete error:", getErrorMessage(error) || error);
    },
  });

  const handleConfirm = async () => {
    if (isConfirmed) {
      try {
        await toast.promise(
          mutation.mutateAsync(),
          {
            loading: "Видалення пункту меню...",
            success: "Пункт меню видалено!",
            error: (err) => {
              console.log(err);
              if (err.response?.status === 400) {
                return "Не вдалося видалити пункт меню: можливо, він використовується";
              }
              return (
                err.response?.data?.error ||
                err?.message ||
                "Помилка при видаленні пункту меню"
              );
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
        <h2 className="text-xl font-semibold mb-4">Видалення пункту меню</h2>
        <p className="text-gray-600 mb-4">
          Ви впевнені, що хочете видалити <b>&#34;{menuItemName}&#34;</b> з
          категорії &#34;<b>{categoryName}</b>&#34;? Цю дію не можна скасувати.
        </p>
        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Помилка</p>
            <p>{getErrorMessage(mutation.error) || "Невідома помилка"}</p>
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
            Я підтверджую видалення пункту меню.
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

export { DeleteMenuItemModal };
