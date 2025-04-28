import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";
import axios from "axios";
import type { UserProfile, ProfileUpdateData } from "@/@types";
import type { User } from "@/@types";

export const UsersApi = {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get<UserProfile>(
        ApiRoutes.USER_PROFILE,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await axiosInstance.patch<UserProfile>(
        ApiRoutes.USER_PROFILE,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.patch<{ message: string }>(
        ApiRoutes.USER_CHANGE_PASSWORD,
        { currentPassword, newPassword, userId },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        if (error.response.data?.message === "Неправильний поточний пароль") {
          throw new Error("Неправильний поточний пароль");
        }
        if (
          error.response.data?.message ===
          "Новий пароль має відрізнятися від поточного"
        ) {
          throw new Error("Новий пароль має відрізнятися від поточного");
        }
      }
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteAccount(
    password: string,
    cancelFutureReservations: boolean,
    confirmation: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>(
        ApiRoutes.USER_PROFILE,
        {
          data: {
            password,
            cancelFutureReservations,
            confirmation,
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        if (error.response.data?.message === "Неправильний пароль") {
          throw new Error("Неправильний пароль");
        }
        if (error.response.data?.message === "Невірне підтвердження") {
          throw new Error("Невірне підтвердження");
        }
      }
      throw new Error(getErrorMessage(error));
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>(
        `${ApiRoutes.PROTECTED_USERS}`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося отримати список користувачів",
      );
    }
  },

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>(
        `${ApiRoutes.PROTECTED_USERS}?role=${role}`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося отримати список користувачів",
      );
    }
  },

  async deleteUser(
    userId: string,
    cancelUserReservations: boolean,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>(
        `${ApiRoutes.PROTECTED_USERS}?id=${userId}`,
        {
          data: { cancelReservations: cancelUserReservations },
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося видалити користувача",
      );
    }
  },

  async promoteToManager(userId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.patch<{ message: string }>(
        `${ApiRoutes.PROTECTED_USERS}?id=${userId}&action=promote`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error) || "Не вдалося змінити роль користувача",
      );
    }
  },
};
