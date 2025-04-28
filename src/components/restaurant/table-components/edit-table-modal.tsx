"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import toast from "react-hot-toast";
import { TablesApi } from "@/services";
import { MyButton, MyTextField, MySelect } from "@/components/ui";
import type { Table, TableFormData } from "@/@types";
import { TableFormSchema } from "@/zod-schemas";

interface EditTableModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUpdateAction: (updatedTable: Table) => void;
  restaurantId: number;
  initialData?: {
    id?: number;
    tableNumber: number;
    capacity: number;
    status: "free" | "reserved" | "occupied";
  } | null;
}

export const EditTableModal: React.FC<EditTableModalProps> = ({
  isOpen,
  onCloseAction,
  onUpdateAction,
  restaurantId,
  initialData = null,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<TableFormData>({
    resolver: zodResolver(TableFormSchema),
    defaultValues: {
      tableNumber: undefined,
      capacity: 2,
      status: "free",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        tableNumber: initialData?.tableNumber ?? undefined,
        capacity: initialData?.capacity || 2,
        status: initialData?.status || "free",
      });
    }
  }, [isOpen, initialData, form]);

  const isEditing = !!initialData?.id;

  const mutation = useMutation({
    mutationFn: async (data: TableFormData) => {
      const payload = {
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        status: data.status,
        restaurantId,
      };

      if (isEditing && initialData?.id) {
        return TablesApi.update(initialData.id, payload);
      }
      return TablesApi.create(payload);
    },
    onSuccess: async (updatedTable) => {
      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId],
      });
      onUpdateAction(updatedTable);
      onCloseAction();
    },
  });

  const onSubmit = async (data: TableFormData) => {
    await toast.promise(mutation.mutateAsync(data), {
      loading: isEditing ? "Оновлення столика..." : "Додавання столика...",
      success: isEditing ? "Столик оновлено!" : "Столик додано!",
      error: (err) => {
        console.log(err);
        if (err.response?.status === 400) {
          return "Столик з таким номером вже існує";
        }
        return err?.message || "Помилка при збереженні столика";
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onCloseAction}
      fullWidth
      PaperProps={{
        sx: { maxWidth: 400, width: "100%" },
      }}
    >
      <DialogTitle>
        {isEditing ? "Редагувати столик" : "Додати столик"}
      </DialogTitle>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="tableNumber"
              label="Номер столика *"
              control={form.control}
              sx={{ "& input": { placeholder: "Введіть номер столика" } }}
              disabled={mutation.isPending}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <MySelect
              name="capacity"
              label="Місткість *"
              control={form.control}
              options={[2, 3, 4, 5, 6, 7, 8, 10].map((val) => ({
                label: `${val}`,
                value: val,
              }))}
              disabled={mutation.isPending}
              sx={{ minWidth: "100%" }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <MySelect
              name="status"
              label="Статус *"
              control={form.control}
              options={[
                { label: "Вільний", value: "free" },
                { label: "Заброньований", value: "reserved" },
                { label: "Зайнятий", value: "occupied" },
              ]}
              disabled={mutation.isPending || !isEditing}
              sx={{ minWidth: "100%" }}
            />
          </Box>
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
            customvariant="confirm"
            type="submit"
            disabled={mutation.isPending}
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
