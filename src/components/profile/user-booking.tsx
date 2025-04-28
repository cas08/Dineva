"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  Chip,
} from "@mui/material";
import { ReservationsApi } from "@/services";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MyButton } from "@/components/ui";
import { UpdateContactModal } from "@/components/profile/modal-components/update-contact-info";
import { CancelReservationModal } from "@/components/profile/modal-components/cancel-reservation";
import { formatDateToReadableString, isDateInPast } from "@/utils/date-utils";
import type { UserReservation } from "@/@types";
import { sortReservations } from "@/utils/reservation-utils";

export function UserBookings() {
  const [onlyActive, setOnlyActive] = useState(true);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<UserReservation | null>(null);

  const {
    data: reservations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<UserReservation[]>({
    queryKey: ["userReservations", !onlyActive],
    queryFn: () => ReservationsApi.getMyReservations(!onlyActive), // showPast = !onlyActive
    staleTime: 1000 * 60 * 5,
  });

  const handleOpenUpdateModal = (reservation: UserReservation) => {
    setSelectedReservation(reservation);
    setUpdateModalOpen(true);
  };

  const handleOpenCancelModal = (reservation: UserReservation) => {
    setSelectedReservation(reservation);
    setCancelModalOpen(true);
  };

  const getReservationInfoString = (reservation: UserReservation) => {
    return `${formatDateToReadableString(reservation.date)} з ${reservation.startTime} до ${
      reservation.endTime
    }, ${reservation.restaurantAddress}, Стіл №${reservation.tableNumber}`;
  };

  type StatusColorType = "success" | "info" | "default";

  const getStatusProps = (
    status: string,
  ): { color: StatusColorType; label: string } => {
    switch (status) {
      case "active":
        return { color: "success", label: "Активно" };
      case "cancelled":
        return { color: "default", label: "Скасовано" };
      case "completed":
        return { color: "info", label: "Завершено" };
      default:
        return { color: "default", label: status };
    }
  };

  const sortedReservations = [...reservations].sort((a, b) =>
    sortReservations(a, b, onlyActive),
  );

  const renderHeader = () => (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
    >
      <Typography variant="h5">Ваші бронювання</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "var(--primary)",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--primary)",
              },
            }}
          />
        }
        label="Лише активні"
      />
    </Box>
  );

  if (isLoading) {
    return (
      <Box>
        {renderHeader()}
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress style={{ color: "var(--primary)" }} />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        {renderHeader()}
        <Box textAlign="center" p={4}>
          <Typography variant="h6" color="error">
            Помилка завантаження бронювань
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => refetch()}>
            Спробувати знову
          </Button>
        </Box>
      </Box>
    );
  }

  if (reservations.length === 0) {
    return (
      <Box>
        {renderHeader()}
        <Box textAlign="center" p={4}>
          <Typography variant="h6" color="text.secondary">
            {onlyActive
              ? "У вас немає активних бронювань"
              : "У вас немає бронювань"}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: "var(--primary)" }}
            component={Link}
            href="/reservations"
          >
            Забронювати стіл
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {renderHeader()}
      <Grid container spacing={3}>
        {sortedReservations.map((reservation) => {
          const statusProps = getStatusProps(reservation.status);
          const isPast = isDateInPast(reservation.date);

          return (
            <Grid size={12} key={reservation.id}>
              <Card
                elevation={2}
                sx={reservation.status !== "active" ? { opacity: 0.8 } : {}}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Chip
                        label={statusProps.label}
                        color={statusProps.color}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Адреса: {reservation.restaurantAddress}
                      </Typography>
                      <Typography variant="body2">
                        Стіл №{reservation.tableNumber}
                      </Typography>
                      <Typography variant="body2">
                        Кількість осіб: {reservation.peopleCount}
                      </Typography>
                    </Grid>

                    <Grid size={6} textAlign="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatDateToReadableString(reservation.date)}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {reservation.startTime} - {reservation.endTime}
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid size={12}>
                      <Typography variant="body2">
                        <strong>Контактна особа:</strong>{" "}
                        {reservation.customerName} {reservation.customerSurname}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Номер телефону:</strong>{" "}
                        {reservation.customerPhone}
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        gap={1}
                        mt={1}
                      >
                        {reservation.status === "active" && !isPast && (
                          <MyButton
                            customvariant="edit"
                            size="small"
                            onClick={() => handleOpenUpdateModal(reservation)}
                          >
                            Змінити контактні дані
                          </MyButton>
                        )}

                        {reservation.status === "active" && !isPast && (
                          <MyButton
                            customvariant="delete"
                            size="small"
                            onClick={() => handleOpenCancelModal(reservation)}
                          >
                            Скасувати
                          </MyButton>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "var(--primary)" }}
          component={Link}
          href="/reservations"
        >
          Забронювати новий стіл
        </Button>
      </Box>

      {selectedReservation && (
        <>
          <UpdateContactModal
            open={updateModalOpen}
            onCloseAction={() => setUpdateModalOpen(false)}
            reservation={selectedReservation}
          />
          <CancelReservationModal
            open={cancelModalOpen}
            onCloseAction={() => setCancelModalOpen(false)}
            reservationId={selectedReservation.id}
            reservationInfo={getReservationInfoString(selectedReservation)}
          />
        </>
      )}
    </Box>
  );
}
