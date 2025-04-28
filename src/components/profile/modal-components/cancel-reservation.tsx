"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { MyButton } from "@/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationsApi } from "@/services";
import { toast } from "react-hot-toast";

interface Props {
  open: boolean;
  onCloseAction: () => void;
  reservationId: number;
  reservationInfo: string;
}

export const CancelReservationModal = ({
  open,
  onCloseAction,
  reservationId,
  reservationInfo,
}: Props) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => ReservationsApi.cancelMyReservation(reservationId),
    onSuccess: async () => {
      toast.success("Бронювання успішно скасовано");
      await queryClient.invalidateQueries({ queryKey: ["userReservations"] });
      onCloseAction();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося скасувати бронювання",
      );
    },
  });

  const handleClose = () => {
    if (!cancelMutation.isPending) {
      setIsConfirmed(false);
      onCloseAction();
    }
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      cancelMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box fontWeight="bold" color="error.main">
          Скасування бронювання
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" mb={2}>
          Ви впевнені, що хочете скасувати бронювання?
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          {reservationInfo}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              disabled={cancelMutation.isPending}
            />
          }
          label="Я підтверджую скасування бронювання"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MyButton
          customvariant="cancel"
          onClick={handleClose}
          disabled={cancelMutation.isPending}
        >
          Назад
        </MyButton>
        <MyButton
          customvariant="delete"
          onClick={handleConfirm}
          disabled={!isConfirmed || cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <CircularProgress style={{ color: "var(--primary)" }} size={24} />
          ) : (
            "Скасувати бронювання"
          )}
        </MyButton>
      </DialogActions>
    </Dialog>
  );
};
