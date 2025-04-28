"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MyButton, MyTextField, PhoneInput } from "@/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationsApi } from "@/services";
import { toast } from "react-hot-toast";
import { ContactInfoSchema } from "@/zod-schemas";
import type { ReservationFormData } from "@/@types";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  reservation: {
    id: number;
    customerName: string;
    customerSurname: string;
    customerPhone: string;
    date: string;
    startTime: string;
    endTime: string;
  };
};

export const UpdateContactModal = ({
  open,
  onCloseAction,
  reservation,
}: Props) => {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: {
      customerName: reservation.customerName,
      customerSurname: reservation.customerSurname,
      customerPhone: reservation.customerPhone
        ? "+".concat(reservation.customerPhone)
        : "+380",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({
        customerName: reservation.customerName,
        customerSurname: reservation.customerSurname,
        customerPhone: reservation.customerPhone
          ? "+".concat(reservation.customerPhone)
          : "+380",
      });
    }
  }, [open, reservation, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ReservationFormData) => {
      const formattedData = {
        customerName: data.customerName,
        customerSurname: data.customerSurname,
        customerPhone:
          data.customerPhone === "+380" ? "" : data.customerPhone || "",
      };

      return ReservationsApi.updateContactInfo(reservation.id, formattedData);
    },
    onSuccess: async () => {
      toast.success("Контактну інформацію оновлено");
      await queryClient.invalidateQueries({ queryKey: ["userReservations"] });
      onCloseAction();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося оновити контактну інформацію",
      );
    },
  });

  const handleClose = () => {
    if (!updateMutation.isPending) {
      reset();
      onCloseAction();
    }
  };

  const onSubmit = (data: ReservationFormData) => {
    const cleanedData = {
      customerName: data.customerName,
      customerSurname: data.customerSurname,
      customerPhone:
        data.customerPhone === "+380"
          ? ""
          : (data.customerPhone || "").replace(/^\+/, ""),
    };

    updateMutation.mutate(cleanedData);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Box fontWeight="bold">Редагування контактної інформації</Box>
        </DialogTitle>

        <DialogContent>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Бронювання на {reservation.date} • {reservation.startTime} -{" "}
              {reservation.endTime}
            </Typography>
          </Box>

          <Box>
            <Grid container>
              <Grid size={12}>
                <MyTextField
                  name="customerName"
                  label="Ім'я *"
                  control={control}
                />
              </Grid>
              <Grid size={12}>
                <MyTextField
                  name="customerSurname"
                  label="Прізвище *"
                  control={control}
                />
              </Grid>
              <Grid size={12} mt={2}>
                <PhoneInput
                  name="customerPhone"
                  label="Номер телефону *"
                  control={control}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MyButton
            customvariant="cancel"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Скасувати
          </MyButton>
          <MyButton
            customvariant="confirm"
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <CircularProgress style={{ color: "var(--primary)" }} size={24} />
            ) : (
              "Зберегти"
            )}
          </MyButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
