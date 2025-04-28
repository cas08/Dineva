"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Box,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { MyButton } from "@/components/ui";
import { useMutation } from "@tanstack/react-query";
import { UsersApi } from "@/services";

interface DeleteUserModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUpdateAction: () => Promise<void>;
  userId: string;
  userName: string;
  userRole: string;
}

export function DeleteUserModal({
  isOpen,
  onCloseAction,
  onUpdateAction,
  userId,
  userName,
  userRole,
}: DeleteUserModalProps) {
  const [cancelReservations, setCancelReservations] = useState(false);

  const mutation = useMutation({
    mutationFn: ({
      userId,
      cancelUserReservations,
    }: {
      userId: string;
      cancelUserReservations: boolean;
    }) => UsersApi.deleteUser(userId, cancelUserReservations),
    onSuccess: async () => {
      toast.success(`Користувача ${userName} успішно видалено`);
      onCloseAction();
      await onUpdateAction();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Помилка видалення користувача");
    },
  });

  const handleDelete = async () => {
    try {
      await mutation.mutateAsync({
        userId,
        cancelUserReservations: cancelReservations,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      onCloseAction();
    }
  };

  return (
    <Box position="relative">
      <Dialog
        open={isOpen}
        onClose={!mutation.isPending ? handleClose : undefined}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Видалення користувача</DialogTitle>
        <DialogContent>
          <DialogContentText color="error" sx={{ mb: 2 }}>
            Увага! Ви збираєтесь видалити{" "}
            {userRole === "MANAGER" ? "менеджера" : "користувача"}{" "}
            <b>{userName}</b>. Це незворотня дія.
          </DialogContentText>

          <Box my={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={cancelReservations}
                  onChange={(e) => setCancelReservations(e.target.checked)}
                  style={{ color: "var(--primary)" }}
                />
              }
              label="Скасувати всі бронювання користувача"
            />
          </Box>

          <DialogContentText sx={{ mt: 2, fontSize: "0.875rem" }}>
            {cancelReservations
              ? "Всі бронювання цього користувача будуть скасовані."
              : "Інформація про користувача буде видалена з бронювань, але самі бронювання залишаться активними."}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <MyButton
            customvariant="cancel"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Скасувати
          </MyButton>
          <MyButton
            customvariant="delete"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress style={{ color: "var(--primary)" }} size={24} />
            ) : (
              "Видалити"
            )}
          </MyButton>
        </DialogActions>
      </Dialog>

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
          zIndex={1300}
        >
          <CircularProgress style={{ color: "var(--neutral)" }} size="3rem" />
        </Box>
      )}
    </Box>
  );
}
