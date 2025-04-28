import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";
import type { GroupedMenuItems, MenuItem } from "@/@types";

export const MenuItemsApi = {
  async getAll(): Promise<GroupedMenuItems[]> {
    try {
      const response = await axiosInstance.get<GroupedMenuItems[]>(
        ApiRoutes.MENU_ITEMS,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    photoUrl?: string;
  }): Promise<MenuItem> {
    try {
      const response = await axiosInstance.post<MenuItem>(
        ApiRoutes.PROTECTED_MENU_ITEMS,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(
        ApiRoutes.PROTECTED_MENU_ITEMS,
        {
          data: { id },
        },
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(data: {
    id: number;
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    photoUrl?: string;
  }): Promise<MenuItem> {
    try {
      const response = await axiosInstance.patch<MenuItem>(
        ApiRoutes.PROTECTED_MENU_ITEMS,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },
};
