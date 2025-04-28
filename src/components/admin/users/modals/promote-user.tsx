"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { MyButton } from "@/components/ui";
import { useMutation } from "@tanstack/react-query";
import { UsersApi } from "@/services";

interface PromoteUserModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUpdateAction: () => Promise<void>;
  userId: string;
  userName: string;
}

export function PromoteUserModal({
  isOpen,
  onCloseAction,
  onUpdateAction,
  userId,
  userName,
}: PromoteUserModalProps) {
  const mutation = useMutation({
    mutationFn: (userId: string) => UsersApi.promoteToManager(userId),
    onSuccess: async () => {
      toast.success(`Користувача ${userName} призначено менеджером`);
      onCloseAction();
      await onUpdateAction();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Помилка зміни ролі користувача");
    },
  });

  const handlePromote = async () => {
    try {
      await mutation.mutateAsync(userId);
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
        <DialogTitle>Призначення менеджером</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ви збираєтесь призначити <b>{userName}</b> на роль менеджера
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: "bold" }}>
            Ви впевнені, що хочете продовжити?
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
            customvariant="confirm"
            onClick={handlePromote}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress style={{ color: "var(--primary)" }} size={24} />
            ) : (
              "Зробити менеджером"
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
