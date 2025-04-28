import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Box,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import { Close, Timer } from "@mui/icons-material";
import type { ReservationDetails } from "@/@types";
import { MyButton } from "@/components/ui";
import { formatDateTime, formatDateToReadableString } from "@/utils/date-utils";

interface ReservationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  reservation: ReservationDetails | null;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  open,
  onClose,
  reservation,
}) => {
  if (!reservation) return null;

  const STATUS_TRANSLATIONS: Record<string, string> = {
    active: "Активне",
    cancelled: "Скасоване",
    completed: "Завершене",
  };

  const STATUS_COLORS: Record<
    string,
    "success" | "error" | "warning" | "default"
  > = {
    active: "success",
    cancelled: "error",
    completed: "default",
  };

  const formatUserInfo = (
    user: { name?: string; surname?: string; email: string } | null | undefined,
    userId?: string | null,
    role?: string | null,
    isAutoCompleted?: boolean,
  ) => {
    if (isAutoCompleted) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Timer fontSize="small" color="action" />
          <span>Автоматично системою</span>
        </Box>
      );
    }

    if (!user && !userId) return "—";

    const namePart = user?.name
      ? `${user.name}${user.surname ? ` ${user.surname}` : ""}`
      : userId || "—";

    const emailPart = user?.email ? ` (${user.email})` : "";
    const rolePart = role ? ` - ${role}` : "";
    const idPart = userId ? ` [ID: ${userId}]` : "";

    return (
      <>
        {namePart}
        {emailPart}
        {rolePart}
        {idPart}
      </>
    );
  };
  const isCreatedByStaff =
    reservation.createdBy == "Admin" || reservation.createdBy == "Manager";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
        }}
      >
        <Typography
          component="div"
          variant="h6"
          sx={{ fontWeight: "500", fontSize: "1.25rem" }}
        >
          Деталі бронювання №{reservation.id}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          mb={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Chip
            label={
              STATUS_TRANSLATIONS[reservation.status] || reservation.status
            }
            color={STATUS_COLORS[reservation.status] || "default"}
            variant="outlined"
            size="medium"
          />
          <Typography variant="body2" color="text.secondary">
            Створено: {formatDateTime(reservation.createdAt)}
            {reservation.createdBy && (
              <> • {!isCreatedByStaff ? "Користувачем" : "Персоналом"}</>
            )}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Основна інформація
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="body1">
                  <strong>Дата:</strong>{" "}
                  {formatDateToReadableString(reservation.date)}
                </Typography>
                <Typography variant="body1">
                  <strong>Час:</strong> {reservation.startTime} -{" "}
                  {reservation.endTime}
                </Typography>
                <Typography variant="body1">
                  <strong>Кількість осіб:</strong> {reservation.peopleCount}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body1">
                  <strong>Ресторан:</strong> {reservation.restaurantAddress}
                </Typography>
                <Typography variant="body1">
                  <strong>Номер столу:</strong> {reservation.tableNumber}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Контактна інформація
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="body1">
                  <strong>Ім&#39;я та прізвище:</strong>{" "}
                  {reservation.customerName} {reservation.customerSurname}
                </Typography>
                <Typography variant="body1">
                  <strong>Телефон:</strong> {reservation.customerPhone || "—"}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body1">
                  <strong>Email:</strong>{" "}
                  {!isCreatedByStaff ? reservation.email || "—" : "—"}
                </Typography>
                {!isCreatedByStaff && reservation.userId && (
                  <Typography variant="body1">
                    <strong>ID користувача:</strong> {reservation.userId}
                  </Typography>
                )}
                <Typography variant="body1">
                  <strong>Створено:</strong>{" "}
                  {!isCreatedByStaff ? "Користувачем" : "Персоналом"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Історія змін
            </Typography>
            {reservation.status === "cancelled" && (
              <Box mb={1}>
                <Typography variant="body1" color="error">
                  <strong>Скасовано:</strong>{" "}
                  {formatDateTime(reservation.cancelledAt)}
                </Typography>
                {(reservation.cancelledById ||
                  reservation.cancelledByUser ||
                  reservation.cancelledByRole) && (
                  <Typography variant="body2" component="div">
                    <strong>Хто скасував:</strong>{" "}
                    {formatUserInfo(
                      reservation.cancelledByUser,
                      reservation.cancelledById,
                      reservation.cancelledByRole,
                    )}
                  </Typography>
                )}
              </Box>
            )}
            {reservation.status === "completed" && (
              <Box mb={1}>
                <Typography variant="body1" color="text.secondary">
                  <strong>Завершено:</strong>{" "}
                  {formatDateTime(reservation.completedAt)}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>Хто завершив:</strong>{" "}
                  {formatUserInfo(
                    reservation.completedByUser,
                    reservation.completedById,
                    reservation.completedByRole,
                    reservation.isAutoCompleted,
                  )}
                </Typography>
              </Box>
            )}
            {reservation.status === "active" && (
              <Typography variant="body2" color="text.secondary">
                Бронювання активне, історії змін немає.
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <MyButton customvariant="default" onClick={onClose}>
            Закрити
          </MyButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDetailsModal;
