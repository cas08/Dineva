"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  FormControlLabel,
  Switch,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MyButton } from "@/components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationsApi } from "@/services";
import { toast } from "react-hot-toast";
import { UserReservation } from "@/@types";
import { Cancel, Info } from "@mui/icons-material";
import { formatTime, parseDateString } from "@/utils/date-utils";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

interface UserReservationsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  userId: string;
  userEmail: string;
}

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

export function UserReservationsModal({
  isOpen,
  onCloseAction,
  userId,
  userEmail,
}: UserReservationsModalProps) {
  const [showPast, setShowPast] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<UserReservation | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["userReservations", userId, showPast],
    queryFn: () => ReservationsApi.getUserReservations(userId, showPast),
    enabled: isOpen,
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: number) =>
      ReservationsApi.cancelReservation(reservationId),
    onSuccess: async () => {
      toast.success("Бронювання успішно скасовано");
      await queryClient.invalidateQueries({
        queryKey: ["userReservations", userId],
      });
      setConfirmCancelOpen(false);
      setSelectedReservation(null);
    },
    onError: (error) => {
      toast.error(`Помилка при скасуванні бронювання: ${error.message}`);
    },
  });

  const handleCancelReservation = (reservation: UserReservation) => {
    setSelectedReservation(reservation);
    setConfirmCancelOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedReservation) {
      await cancelMutation.mutateAsync(selectedReservation.id);
    }
  };

  const handleClose = () => {
    if (!cancelMutation.isPending) {
      onCloseAction();
    }
  };

  const columns: MRT_ColumnDef<UserReservation>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 50,
    },
    {
      accessorKey: "customerName",
      header: "Ім'я",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 120,
    },
    {
      accessorKey: "customerSurname",
      header: "Прізвище",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 120,
    },
    {
      accessorKey: "date",
      header: "Дата",
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>();
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
          return dateValue;
        }
        try {
          const date = parseDateString(dateValue);
          return date.toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (error) {
          console.error("Error parsing date:", error);
          return dateValue || "—";
        }
      },
      size: 120,
    },
    {
      accessorKey: "startTime",
      header: "Час початку",
      Cell: ({ cell }) => formatTime(cell.getValue<string>()),
      size: 120,
    },
    {
      accessorKey: "endTime",
      header: "Час кінця",
      Cell: ({ cell }) => formatTime(cell.getValue<string>()),
      size: 120,
    },
    {
      accessorKey: "tableNumber",
      header: "№ столу",
      size: 90,
    },
    {
      accessorKey: "peopleCount",
      header: "К-сть людей",
      size: 110,
    },
    {
      accessorKey: "restaurantAddress",
      header: "Ресторан",
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.3" }}>
          {cell.getValue<string>()}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "status",
      header: "Статус",
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        return (
          <Chip
            label={STATUS_TRANSLATIONS[status] || status}
            color={STATUS_COLORS[status] || "default"}
            variant="outlined"
            size="small"
          />
        );
      },
      size: 120,
    },
    {
      accessorKey: "customerPhone",
      header: "Телефон",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 140,
    },
  ];

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { minHeight: "70vh" },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Бронювання користувача: {userEmail}</span>
            <FormControlLabel
              control={
                <Switch
                  checked={showPast}
                  onChange={(e) => setShowPast(e.target.checked)}
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
              label="Показати всі бронювання"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="400px"
            >
              <CircularProgress style={{ color: "var(--primary)" }} />
            </Box>
          ) : reservations.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="400px"
            >
              <Box textAlign="center">
                <Info sx={{ fontSize: 50, color: "gray", mb: 2 }} />
                <p>У користувача немає бронювань</p>
              </Box>
            </Box>
          ) : (
            <MaterialReactTable
              muiCircularProgressProps={{
                sx: {
                  color: "var(--primary)",
                },
              }}
              columns={columns}
              data={reservations}
              enableRowActions
              positionActionsColumn="last"
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "1rem" }}>
                  {row.original.status === "active" && (
                    <Tooltip title="Скасувати бронювання">
                      <IconButton
                        color="error"
                        onClick={() => handleCancelReservation(row.original)}
                      >
                        <Cancel />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
              initialState={{
                density: "compact",
                pagination: { pageSize: 5, pageIndex: 0 },
                columnVisibility: {
                  customerName: true,
                  customerSurname: true,
                },
              }}
              localization={{
                actions: "Дії",
                noRecordsToDisplay: "Немає бронювань для відображення",
              }}
              muiTableContainerProps={{
                sx: { minHeight: "400px" },
              }}
            />
          )}
        </DialogContent>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <MyButton customvariant="cancel" onClick={handleClose}>
            Закрити
          </MyButton>
        </Box>
      </Dialog>

      {selectedReservation && (
        <>
          <ConfirmActionDialog
            open={confirmCancelOpen}
            onCloseAction={() => setConfirmCancelOpen(false)}
            onConfirmAction={confirmCancel}
            title="Підтвердження скасування"
            message="Ви впевнені, що хочете скасувати цю резервацію?"
            confirmButtonText="Так, скасувати"
            actionType="cancel"
            isLoading={cancelMutation.isPending}
            reservationDetails={{
              id: selectedReservation.id,
              customerName: selectedReservation.customerName,
              customerSurname: selectedReservation.customerSurname,
              date: selectedReservation.date,
              startTime: selectedReservation.startTime,
              endTime: selectedReservation.endTime,
              peopleCount: selectedReservation.peopleCount,
            }}
          />
        </>
      )}
    </>
  );
}
