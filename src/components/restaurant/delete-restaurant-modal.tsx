"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { MyButton } from "@/components/ui";
import { RestaurantsApi, AddressesApi, CitiesApi } from "@/services";
import { getErrorMessage } from "@/utils/error-utils";

interface DeleteRestaurantModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  addressId: number;
  addressName: string;
  cityId: number;
  cityName: string;
}

export const DeleteRestaurantModal: React.FC<DeleteRestaurantModalProps> = ({
  isOpen,
  onCloseAction,
  addressId,
  addressName,
  cityId,
  cityName,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        await RestaurantsApi.deleteByAddress(addressId);

        await AddressesApi.delete(addressId);
        const remainingAddresses = await AddressesApi.getAll();

        const addressesInCity = remainingAddresses.filter(
          (addr) => addr.cityId === cityId,
        );
        if (addressesInCity.length === 0) {
          await CitiesApi.delete(cityId);
        }
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        if (
          errorMsg.includes("прив'язані столики") ||
          (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "HAS_RELATED_TABLES")
        ) {
          throw new Error(
            "Неможливо видалити ресторан, оскільки до нього прив'язані столики. Спочатку видаліть всі столики в ресторані.",
          );
        }
        throw new Error(errorMsg || "Помилка під час видалення");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
        queryClient.invalidateQueries({ queryKey: ["addresses"] }),
        queryClient.invalidateQueries({ queryKey: ["cities"] }),
      ]);
      setErrorMessage(null);
      onCloseAction();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      setErrorMessage(message);
      console.error("Delete error:", message);
    },
  });

  const handleConfirm = async () => {
    if (isConfirmed) {
      await toast.promise(
        mutation.mutateAsync(),
        {
          loading: "Видалення ресторану...",
          success: "Ресторан успішно видалено!",
          error: (err: unknown) => {
            const message = getErrorMessage(err);
            if (message.includes("прив'язані столики")) {
              return "Неможливо видалити ресторан, оскільки до нього прив'язані столики";
            }
            return message || "Помилка при видаленні ресторану";
          },
        },
        {
          style: { pointerEvents: "none" },
        },
      );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onCloseAction} maxWidth="sm" fullWidth>
      <DialogTitle>Видалення ресторану</DialogTitle>
      <DialogContent>
        <p className="text-gray-600 mb-4">
          Ви дійсно хочете видалити ресторан в м. <b>{cityName}</b> за адресою{" "}
          <b>{addressName}</b>? Цю дію не можна скасувати.
        </p>
        {errorMessage && (
          <p className="text-red-500 mb-4 p-3 bg-red-100 rounded-md border border-red-300">
            {errorMessage}
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
            Я підтверджую видалення ресторану.
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
          onClick={handleConfirm}
          disabled={!isConfirmed || mutation.isPending}
        >
          {mutation.isPending ? "Видаляється..." : "Видалити"}
        </MyButton>
      </DialogActions>
    </Dialog>
  );
};
