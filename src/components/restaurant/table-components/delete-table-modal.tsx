"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TablesApi } from "@/services";
import { MyButton } from "@/components/ui";
import { getErrorMessage } from "@/utils/error-utils";

interface DeleteTableConfirmModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  tableId: number;
  tableNumber: number;
  restaurantId: number;
}

export const DeleteTableConfirmModal: React.FC<
  DeleteTableConfirmModalProps
> = ({ isOpen, onCloseAction, tableId, tableNumber, restaurantId }) => {
  const queryClient = useQueryClient();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const mutation = useMutation({
    mutationFn: () => TablesApi.delete(tableId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] }),
      ]);
      onCloseAction();
    },
    onError: (error: unknown) => {
      console.error("Delete error:", getErrorMessage(error) || error);
    },
  });

  const handleDelete = async () => {
    if (isConfirmed) {
      try {
        await toast.promise(
          mutation.mutateAsync(),
          {
            loading: "Видалення столика...",
            success: "Столик видалено!",
            error: (err) => {
              console.log(err);
              if (err.response?.status === 400) {
                return "Не вдалося видалити столик: можливо, він пов’язаний з активними замовленнями";
              }
              return (
                err.response?.data?.error ||
                err?.message ||
                "Помилка при видаленні столика"
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
    <Dialog open={isOpen} onClose={onCloseAction} maxWidth="xs" fullWidth>
      <DialogTitle> підтвердження видалення</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Ви дійсно хочете видалити <b>столик №{tableNumber}</b>? Цю дію не
          можна скасувати.
        </Typography>

        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="confirmTableDelete"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            disabled={mutation.isPending}
            className="mr-2"
          />
          <label htmlFor="confirmTableDelete" className="text-sm text-gray-700">
            Я підтверджую видалення столика.
          </label>
        </div>
      </DialogContent>
      <DialogActions>
        <MyButton
          customvariant="cancel"
          onClick={onCloseAction}
          disabled={mutation.isPending}
        >
          Скасувати
        </MyButton>
        <MyButton
          customvariant="delete"
          onClick={handleDelete}
          disabled={!isConfirmed || mutation.isPending}
        >
          {mutation.isPending ? "Видаляється..." : "Видалити"}
        </MyButton>
      </DialogActions>
    </Dialog>
  );
};
