import type { Reservation } from "@prisma/client";
import * as z from "zod";
import { ContactInfoSchema } from "@/zod-schemas";
import { UserInfo } from "@/@types";

export type TimeSlotAvailability = {
  time: string;
  available: boolean;
  availableTables: number[];
};

export type UserReservation = Reservation & {
  date: string;
  tableNumber: number;
  restaurantAddress: string;
};

export type ReservationWithTable = Reservation & {
  date: string;
  table: {
    tableNumber: string;
    capacity: number;
  };
};

export type ContactInfoUpdate = {
  customerName: string;
  customerSurname: string;
  customerPhone: string;
};

export type CreateReservation = Omit<
  Reservation,
  | "id"
  | "status"
  | "createdBy"
  | "createdAt"
  | "completedAt"
  | "completedById"
  | "completedByRole"
  | "cancelledAt"
  | "cancelledById"
  | "cancelledByRole"
  | "isAutoCompleted"
  | "date"
> & {
  date: string;
};

export type ReservationModal = {
  id: number;
  customerName?: string;
  customerSurname?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  tableNumber?: string | number;
  peopleCount?: number;
};

export type TimeSlot = {
  time: string;
  available: boolean;
  availableTables: number[];
};

export type ReservationPayload = {
  tableId: number;
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  peopleCount: number;
  userId: string | null;
  email: string | null;
};

export type ReservationsResponse = {
  reservations: UserReservation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type ReservationDetails = UserReservation & {
  createdAt: string | Date;
  completedAt?: string | Date | null;
  completedById?: string | null;
  completedByRole?: string | null;
  completedByUser?: UserInfo | null;
  cancelledAt?: string | Date | null;
  cancelledById?: string | null;
  cancelledByRole?: string | null;
  cancelledByUser?: UserInfo | null;
  userEmail?: string;
  createdBy?: string;
  isAutoCompleted?: boolean;
};

export type ReservationFormData = z.infer<typeof ContactInfoSchema>;
