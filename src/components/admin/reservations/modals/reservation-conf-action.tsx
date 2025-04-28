import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  CircularProgress,
} from "@mui/material";
import { MyButton } from "@/components/ui";
import { UserReservation } from "@/@types";

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  actionType: "cancel" | "complete";
  reservation: UserReservation | null;
  isLoading: boolean;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  onClose,
  onConfirm,
  actionType,
  reservation,
  isLoading,
}) => {
  if (!reservation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {actionType === "cancel"
          ? "Підтвердження скасування"
          : "Підтвердження завершення"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <p>Бронювання №{reservation.id}</p>
          <p>
            Клієнт: {reservation.customerName || "—"}{" "}
            {reservation.customerSurname || "—"}
          </p>
          <p>Дата: {reservation.date}</p>
          <p>
            Час: {reservation.startTime?.substring(0, 5) || "—"} -{" "}
            {reservation.endTime?.substring(0, 5) || "—"}
          </p>
        </Box>
        <p>
          <strong>
            {actionType === "cancel"
              ? "Ви впевнені, що хочете скасувати це бронювання?"
              : "Ви впевнені, що хочете позначити це бронювання як завершене?"}
          </strong>
        </p>
      </DialogContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <MyButton customvariant="cancel" onClick={onClose} sx={{ mr: 1 }}>
          Ні
        </MyButton>
        <MyButton
          customvariant={actionType === "cancel" ? "delete" : "confirm"}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} style={{ color: "var(--neutral)" }} />
          ) : actionType === "cancel" ? (
            "Так, скасувати"
          ) : (
            "Так, завершити"
          )}
        </MyButton>
      </Box>
    </Dialog>
  );
};

export default ConfirmActionModal;
