"use client";

import { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MyButton, MyTextField, PhoneInput } from "@/components/ui";
import { ReservationsApi } from "@/services/all/reservation-service";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReservationPayload, ReservationFormData } from "@/@types";
import { ContactInfoSchema } from "@/zod-schemas";
import { getErrorMessage } from "@/utils/error-utils";

interface Props {
  open: boolean;
  onCloseAction: () => void;
  onConfirmAction: (data: ReservationPayload) => void;
  restaurantName: string;
  date: string;
  startTime: string;
  endTime: string;
  people: string;
  tableId: number;
}

export const ReservationModal = ({
  open,
  onCloseAction,
  onConfirmAction,
  restaurantName,
  date,
  startTime,
  endTime,
  people,
  tableId,
}: Props) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: {
      customerName: "",
      customerSurname: "",
      customerPhone: "+380",
    },
  });

  const { handleSubmit, control, reset } = form;

  const mutation = useMutation({
    mutationFn: (payload: ReservationPayload) =>
      ReservationsApi.create(payload),
    onSuccess: async (variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["availableTables", date],
      });
      await queryClient.invalidateQueries({ queryKey: ["userReservations"] });
      onConfirmAction(variables);
    },
    onError: async (error) => {
      console.error("Mutation error:", error);

      const errorMessage = getErrorMessage(error);

      if (errorMessage.includes("Користувач більше не існує")) {
        onCloseAction();

        toast.error("Ваш обліковий запис більше не існує.", {
          duration: 5000,
          position: "top-center",
        });

        await signOut({ redirect: false });
        await queryClient.invalidateQueries();

        return;
      }

      if (errorMessage.includes("Роль користувача змінилася")) {
        onCloseAction();

        toast.error(
          "Ваші права доступу змінилися. Необхідне повторне входження в систему.",
          {
            duration: 5000,
            position: "top-center",
          },
        );

        await signOut({ redirect: false });
        return;
      }

      toast.error(errorMessage || "Сталася невідома помилка.", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  useEffect(() => {
    if (session?.user) {
      let firstName = "";
      let lastName = "";
      let phone = "+380";

      if (session.user.name) {
        firstName = session.user.name;
      }

      if (session.user.surname) {
        lastName = session.user.surname;
      }

      if (session.user.phoneNumber) {
        phone = session.user.phoneNumber.startsWith("+")
          ? session.user.phoneNumber
          : "+" + session.user.phoneNumber;
      }

      reset({
        customerName: firstName,
        customerSurname: lastName,
        customerPhone: phone,
      });
    }
  }, [session, reset, open]);

  const submitHandler = async (formData: ReservationFormData) => {
    const payload: ReservationPayload = {
      tableId,
      customerName: formData.customerName,
      customerSurname: formData.customerSurname,
      customerPhone: formData.customerPhone.replace(/^\+/, ""),
      date,
      startTime,
      endTime,
      peopleCount: +people,
      userId: session?.user?.id || null,
      email: session?.user?.email || null,
    };

    try {
      await toast.promise(
        mutation.mutateAsync(payload),
        {
          loading: "Створення бронювання...",
          success: "Бронювання успішно створено!",
          error: (err) => {
            console.error("Reservation error:", err);

            if (
              err.response?.data?.error === "Користувач більше не існує" ||
              err.message?.includes("Користувач більше не існує")
            ) {
              return null;
            }

            if (err.response?.status === 409) {
              return "Цей стіл вже заброньовано на вказаний час";
            } else if (err.response?.status === 400) {
              return "Невірні дані бронювання. Перевірте введену інформацію";
            } else if (
              err.response?.status === 401 ||
              err.response?.status === 403
            ) {
              return "Помилка авторизації. Спробуйте увійти знову";
            }

            return err?.message || "Помилка при створенні бронювання";
          },
        },
        {
          style: { pointerEvents: "none" },
        },
      );
    } catch (error) {
      console.error("Handle submission error:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!mutation.isPending ? onCloseAction : undefined}
      fullWidth
      maxWidth="xs"
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <DialogTitle>
          <Box fontWeight="bold">Бронювання столика</Box>
        </DialogTitle>

        <DialogContent>
          <Typography>
            <b>Ресторан:</b> {restaurantName}
          </Typography>
          <Typography>
            <b>Дата:</b> {date}
          </Typography>
          <Typography>
            <b>Час:</b> {startTime} - {endTime}
          </Typography>
          <Typography>
            <b>Кількість людей:</b> {people}
          </Typography>

          <Box mt={2}>
            <Grid container>
              <Grid size={12}>
                <MyTextField
                  name="customerName"
                  label="Ім'я *"
                  control={control}
                  disabled={mutation.isPending}
                />
              </Grid>
              <Grid size={12}>
                <MyTextField
                  name="customerSurname"
                  label="Прізвище *"
                  control={control}
                  disabled={mutation.isPending}
                />
              </Grid>
              <Grid size={12} mt={3}>
                <PhoneInput
                  name="customerPhone"
                  control={control}
                  label={"Номер телефону *"}
                  disabled={mutation.isPending}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MyButton
            customvariant="cancel"
            onClick={onCloseAction}
            disabled={mutation.isPending}
          >
            Скасувати
          </MyButton>
          <MyButton
            customvariant="confirm"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress style={{ color: "var(--primary)" }} size={20} />
            ) : (
              "Підтвердити"
            )}
          </MyButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
