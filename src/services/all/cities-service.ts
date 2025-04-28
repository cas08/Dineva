import type { City } from "@/@types";
import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";

export const CitiesApi = {
  async getAll(): Promise<City[]> {
    try {
      const response = await axiosInstance.get<City[]>(ApiRoutes.CITIES);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(cityName: string): Promise<City> {
    try {
      const response = await axiosInstance.post<City>(
        ApiRoutes.PROTECTED_CITIES,
        {
          cityName,
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id: number, cityName: string): Promise<City> {
    try {
      const response = await axiosInstance.put<City>(
        ApiRoutes.PROTECTED_CITIES,
        {
          id,
          cityName,
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(ApiRoutes.PROTECTED_CITIES, {
        data: { id },
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },
};
