import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";
import type {
  TimeSlotAvailability,
  UserReservation,
  ContactInfoUpdate,
  CreateReservation,
  ReservationsResponse,
  ReservationDetails,
  ReservationWithTable,
} from "@/@types";
import { isAxiosError } from "axios";

export const ReservationsApi = {
  async getByRestaurantAndDate(
    restaurantId: number,
    date: string,
  ): Promise<ReservationWithTable[]> {
    try {
      const response = await axiosInstance.get<ReservationWithTable[]>(
        `${ApiRoutes.PROTECTED_RESERVATIONS}?restaurantId=${restaurantId}&date=${date}`,
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [];
        }
      }
      throw new Error(
        getErrorMessage(error) ||
          "Не вдалося отримати резервації на вибрану дату",
      );
    }
  },

  async getByTableAndDate(
    tableId: number,
    restaurantId: number,
    date: string,
  ): Promise<ReservationWithTable[]> {
    try {
      const response = await axiosInstance.get<ReservationWithTable[]>(
        `${ApiRoutes.PROTECTED_RESERVATIONS}?restaurantId=${restaurantId}&tableId=${tableId}&date=${date}`,
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [];
        }
      }
      throw new Error(
        getErrorMessage(error) ||
          "Не вдалося отримати резервації для столика на вибрану дату",
      );
    }
  },

  async getAvailableTimeSlots(
    restaurantId: number,
    date: string,
    peopleCount: number,
    duration: string,
  ): Promise<TimeSlotAvailability[]> {
    try {
      const response = await axiosInstance.get<TimeSlotAvailability[]>(
        `${ApiRoutes.RESERVATIONS}/available?restaurantId=${restaurantId}&date=${date}&peopleCount=${peopleCount}&duration=${duration}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errMessage = getErrorMessage(error);
      throw new Error(errMessage || "Не вдалося отримати доступні таймслоти");
    }
  },

  async getMyReservations(
    showPast: boolean = false,
  ): Promise<UserReservation[]> {
    try {
      const response = await axiosInstance.get<UserReservation[]>(
        `${ApiRoutes.USER_RESERVATIONS}?showPast=${showPast}`,
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [];
        }
      }
      throw new Error(
        getErrorMessage(error) || "Не вдалося отримати ваші бронювання",
      );
    }
  },

  async create(data: CreateReservation): Promise<UserReservation> {
    try {
      const response = await axiosInstance.post<UserReservation>(
        ApiRoutes.RESERVATIONS,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(
        getErrorMessage(error) || "Не вдалося створити резервацію",
      );
    }
  },

  async cancelMyReservation(
    reservationId: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.patch<{
        success: boolean;
        message: string;
      }>(`${ApiRoutes.RESERVATIONS}?reservationId=${reservationId}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося скасувати бронювання",
      );
    }
  },

  async updateContactInfo(
    reservationId: number,
    data: ContactInfoUpdate,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.patch<{
        success: boolean;
        message: string;
      }>(`${ApiRoutes.USER_RESERVATIONS}?reservationId=${reservationId}`, data);

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося оновити контактну інформацію",
      );
    }
  },

  async getUserReservations(
    userId: string,
    showPast: boolean = false,
  ): Promise<UserReservation[]> {
    try {
      const response = await axiosInstance.get<UserReservation[]>(
        `${ApiRoutes.PROTECTED_RESERVATIONS}/by-user?userId=${userId}&showPast=${showPast}`,
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [];
        }
      }
      throw new Error(
        getErrorMessage(error) || "Не вдалося отримати бронювання користувача",
      );
    }
  },

  async getAllReservations(
    params?: URLSearchParams | boolean,
  ): Promise<ReservationsResponse> {
    try {
      let url = `${ApiRoutes.PROTECTED_RESERVATIONS}/all`;

      if (params) {
        if (typeof params === "boolean") {
          url += `?showPast=${params}`;
        } else {
          url += `?${params.toString()}`;
        }
      }

      const response = await axiosInstance.get<ReservationsResponse>(url);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            reservations: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 10,
              pages: 0,
            },
          };
        }
      }

      throw new Error(
        getErrorMessage(error) || "Не вдалося отримати всі бронювання",
      );
    }
  },

  async getReservationDetails(id: number): Promise<ReservationDetails> {
    try {
      const response = await axiosInstance.get<ReservationDetails>(
        `${ApiRoutes.PROTECTED_RESERVATIONS}/detailed?id=${id}`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося отримати деталі бронювання",
      );
    }
  },

  async completeReservation(
    reservationId: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.updateReservationStatus(reservationId, "complete");
  },

  async cancelReservation(
    reservationId: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.updateReservationStatus(reservationId, "cancel");
  },

  async updateReservationStatus(
    reservationId: number,
    action: "cancel" | "complete",
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.patch<{
        success: boolean;
        message: string;
      }>(
        `${ApiRoutes.PROTECTED_RESERVATIONS}?reservationId=${reservationId}&action=${action}`,
      );
      return response.data;
    } catch (error: unknown) {
      const actionType = action === "cancel" ? "скасувати" : "завершити";
      throw new Error(
        getErrorMessage(error) || `Не вдалося ${actionType} бронювання`,
      );
    }
  },

  async completeExpiredReservations(
    restaurantId: number,
  ): Promise<{ success: boolean; message: string; completedCount: number }> {
    try {
      const response = await axiosInstance.post(
        `${ApiRoutes.PROTECTED_RESERVATIONS}/complete-expired?id=${restaurantId}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getErrorMessage(error);
      throw new Error(
        errMessage || "Не вдалося автоматично завершити резервації",
      );
    }
  },
};
