"use client";

import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationsApi } from "@/services/all/reservation-service";
import React, { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { Cancel, Done } from "@mui/icons-material";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import type { ReservationWithTable } from "@/@types";

interface BookingsPanelProps {
  tableId: number;
  restaurantId: number;
  today: string;
}

export const BookingsPanel: React.FC<BookingsPanelProps> = ({
  tableId,
  restaurantId,
  today,
}) => {
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationWithTable | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["tableReservations", tableId, today],
    queryFn: () =>
      ReservationsApi.getByTableAndDate(tableId, restaurantId, today),
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: number) =>
      ReservationsApi.cancelReservation(reservationId),
    onSuccess: async () => {
      toast.success("Резервацію скасовано");
      setCancelDialogOpen(false);
      setSelectedReservation(null);
      await queryClient.invalidateQueries({
        queryKey: ["tableReservations", tableId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["allReservationsCount", restaurantId],
      });
    },
    onError: (error) => {
      toast.error(`Помилка при скасуванні резервації: ${error.message}`);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (reservationId: number) =>
      ReservationsApi.completeReservation(reservationId),
    onSuccess: async () => {
      toast.success("Резервацію завершено");
      setCompleteDialogOpen(false);
      setSelectedReservation(null);
      await queryClient.invalidateQueries({
        queryKey: ["tableReservations", tableId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["allReservationsCount", restaurantId],
      });
    },
    onError: (error) => {
      toast.error(`Помилка при завершенні резервації: ${error.message}`);
    },
  });

  const handleCancel = useCallback((reservation: ReservationWithTable) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  }, []);

  const handleComplete = useCallback((reservation: ReservationWithTable) => {
    setSelectedReservation(reservation);
    setCompleteDialogOpen(true);
  }, []);

  const confirmCancel = () => {
    if (selectedReservation) {
      cancelMutation.mutate(selectedReservation.id);
    }
  };

  const confirmComplete = () => {
    if (selectedReservation) {
      completeMutation.mutate(selectedReservation.id);
    }
  };

  const formatTimeRange = useCallback((startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress style={{ color: "var(--primary)" }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ bgcolor: "#fafafa", borderTop: "1px solid #ddd", p: 2 }}>
        {reservations.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", my: 2, color: "text.secondary" }}
          >
            Немає резервацій на цей столик
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                mb: 1,
                px: 1,
              }}
            >
              <Typography sx={{ flex: 1 }}>Час</Typography>
              <Typography sx={{ flex: 2 }}>Ім&#39;я</Typography>
              <Typography sx={{ flex: 2 }}>Телефон</Typography>
              <Typography sx={{ flex: 1 }}>Осіб</Typography>
              <Typography sx={{ flex: 2, textAlign: "right" }}>Дії</Typography>
            </Box>

            <Divider sx={{ mb: 1 }} />

            {reservations.map((reservation) => (
              <Box
                key={reservation.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 1,
                  py: 0.5,
                  backgroundColor:
                    reservation.status === "cancelled"
                      ? "rgba(244, 67, 54, 0.1)"
                      : reservation.status === "completed"
                        ? "rgba(76, 175, 80, 0.1)"
                        : "transparent",
                  opacity:
                    reservation.status === "cancelled" ||
                    reservation.status === "completed"
                      ? 0.6
                      : 1,
                }}
              >
                <Typography sx={{ flex: 1 }}>
                  {formatTimeRange(reservation.startTime, reservation.endTime)}
                </Typography>
                <Typography sx={{ flex: 2 }}>
                  {`${reservation.customerName} ${reservation.customerSurname}`}
                </Typography>
                <Typography sx={{ flex: 2 }}>
                  {`+${reservation.customerPhone}`}
                </Typography>
                <Typography sx={{ flex: 1 }}>
                  {reservation.peopleCount} осіб
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flex: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  {reservation.status === "active" && (
                    <>
                      <Tooltip title="Скасувати">
                        <IconButton
                          color="error"
                          onClick={() => handleCancel(reservation)}
                          disabled={
                            cancelMutation.isPending ||
                            completeMutation.isPending
                          }
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Завершити">
                        <IconButton
                          onClick={() => handleComplete(reservation)}
                          disabled={
                            cancelMutation.isPending ||
                            completeMutation.isPending
                          }
                          color="success"
                        >
                          <Done />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {reservation.status === "cancelled" && (
                    <Typography sx={{ color: "error.main" }}>
                      Скасовано
                    </Typography>
                  )}
                  {reservation.status === "completed" && (
                    <Typography sx={{ color: "success.main" }}>
                      Завершено
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </>
        )}
      </Box>

      {selectedReservation && (
        <>
          <ConfirmActionDialog
            open={cancelDialogOpen}
            onCloseAction={() => setCancelDialogOpen(false)}
            onConfirmAction={confirmCancel}
            title="Підтвердження скасування"
            message="Ви впевнені, що хочете скасувати цю резервацію?"
            confirmButtonText="Так, скасувати"
            isLoading={cancelMutation.isPending}
            actionType="cancel"
            reservationDetails={{
              id: selectedReservation.id,
              customerName: selectedReservation.customerName,
              customerSurname: selectedReservation.customerSurname,
              date: selectedReservation.date,
              startTime: selectedReservation.startTime,
              endTime: selectedReservation.endTime,
              peopleCount: selectedReservation.peopleCount,
              tableNumber: selectedReservation.table?.tableNumber,
            }}
          />

          <ConfirmActionDialog
            open={completeDialogOpen}
            onCloseAction={() => setCompleteDialogOpen(false)}
            onConfirmAction={confirmComplete}
            title="Підтвердження завершення"
            message="Ви впевнені, що хочете завершити цю резервацію?"
            confirmButtonText="Так, завершити"
            isLoading={completeMutation.isPending}
            actionType="complete"
            reservationDetails={{
              id: selectedReservation.id,
              customerName: selectedReservation.customerName,
              customerSurname: selectedReservation.customerSurname,
              date: selectedReservation.date,
              startTime: selectedReservation.startTime,
              endTime: selectedReservation.endTime,
              peopleCount: selectedReservation.peopleCount,
              tableNumber: selectedReservation.table?.tableNumber,
            }}
          />
        </>
      )}
    </>
  );
};
