"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { MyButton } from "@/components/ui";
import { ReservationModal } from "@/@types";

interface ConfirmActionDialogProps {
  open: boolean;
  onCloseAction: () => void;
  onConfirmAction: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  actionType: "cancel" | "complete" | "delete";
  reservationDetails?: ReservationModal;
}

export const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  onCloseAction,
  onConfirmAction,
  title,
  message,
  confirmButtonText,
  cancelButtonText = "Ні",
  isLoading = false,
  actionType,
  reservationDetails,
}) => {
  const getButtonVariant = () => {
    switch (actionType) {
      case "cancel":
        return "delete";
      case "complete":
        return "confirm";
      case "delete":
        return "delete";
      default:
        return "confirm";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onCloseAction : undefined}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {reservationDetails && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Бронювання №{reservationDetails.id}
            </Typography>
            {(reservationDetails.customerName ||
              reservationDetails.customerSurname) && (
              <Typography variant="body2" gutterBottom>
                Клієнт: {reservationDetails.customerName || "—"}{" "}
                {reservationDetails.customerSurname || "—"}
              </Typography>
            )}
            {reservationDetails.date && (
              <Typography variant="body2" gutterBottom>
                Дата: {reservationDetails.date}
              </Typography>
            )}
            {(reservationDetails.startTime || reservationDetails.endTime) && (
              <Typography variant="body2" gutterBottom>
                Час: {reservationDetails.startTime?.substring(0, 5) || "—"} -{" "}
                {reservationDetails.endTime?.substring(0, 5) || "—"}
              </Typography>
            )}
            {reservationDetails.tableNumber && (
              <Typography variant="body2" gutterBottom>
                Номер столика: {reservationDetails.tableNumber}
              </Typography>
            )}
            {reservationDetails.peopleCount && (
              <Typography variant="body2" gutterBottom>
                Кількість людей: {reservationDetails.peopleCount}
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="body1">
          <strong>{message}</strong>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <MyButton
          customvariant="cancel"
          onClick={onCloseAction}
          disabled={isLoading}
          sx={{ mr: 1 }}
        >
          {cancelButtonText}
        </MyButton>
        <MyButton
          customvariant={getButtonVariant()}
          onClick={onConfirmAction}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} style={{ color: "var(--neutral)" }} />
          ) : (
            confirmButtonText
          )}
        </MyButton>
      </DialogActions>
    </Dialog>
  );
};
