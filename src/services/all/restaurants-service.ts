import type { Restaurant } from "@/@types";
import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";
import axios from "axios";

export const RestaurantsApi = {
  async getAll(): Promise<Restaurant[]> {
    try {
      const response = await axiosInstance.get<Restaurant[]>(
        ApiRoutes.RESTAURANTS,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(addressId: number): Promise<Restaurant> {
    try {
      const response = await axiosInstance.post<Restaurant>(
        ApiRoutes.PROTECTED_RESTAURANTS,
        {
          addressId,
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteByAddress(addressId: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(
        ApiRoutes.PROTECTED_RESTAURANTS,
        {
          data: { addressId },
        },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (
          error.response.status === 409 &&
          error.response.data?.code === "HAS_RELATED_TABLES"
        ) {
          throw new Error(
            "Неможливо видалити ресторан, оскільки до нього прив'язані столики",
          );
        }
      }
      throw error;
    }
  },
};
