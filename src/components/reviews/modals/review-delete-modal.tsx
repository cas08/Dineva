"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MyButton } from "@/components/ui";
import { ReviewsApi } from "@/services";
import { getErrorMessage } from "@/utils/error-utils";

interface DeleteReviewModalProps {
  onClose: () => void;
  reviewId: number;
}

const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({
  onClose,
  reviewId,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => ReviewsApi.delete(reviewId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      onClose();
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
            loading: "Видалення відгуку...",
            success: "Відгук видалено!",
            error: (err) => {
              if (err.response?.status === 400) {
                return "Не вдалося видалити відгук: можливо, він пов’язаний з іншими даними";
              }
              return (
                err.response?.data?.error ||
                err?.message ||
                "Помилка при видаленні відгуку"
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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-semibold mb-4">Видалення відгуку</h2>
        <p className="text-gray-600 mb-4">
          Ви впевнені, що хочете видалити цей коментар? Цю дію не можна
          скасувати.
        </p>
        {mutation.isError && (
          <p className="text-error mb-4">
            Помилка: {getErrorMessage(mutation.error) || "Невідома помилка"}
          </p>
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
            Я підтверджую видалення коментаря.
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

export default DeleteReviewModal;
