import type { Category } from "@/@types";
import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";

export const CategoriesApi = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get<Category[]>(
        ApiRoutes.CATEGORIES,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(name: string): Promise<Category> {
    try {
      const response = await axiosInstance.post<Category>(
        ApiRoutes.PROTECTED_CATEGORIES,
        { name },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id: number, name: string): Promise<Category> {
    try {
      const response = await axiosInstance.patch<Category>(
        ApiRoutes.PROTECTED_CATEGORIES,
        {
          id,
          name,
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(
        ApiRoutes.PROTECTED_CATEGORIES,
        {
          data: { id },
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },
};
