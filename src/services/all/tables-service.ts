import type { Table } from "@/@types";
import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";

export const TablesApi = {
  async getByRestaurant(restaurantId: number): Promise<Table[]> {
    try {
      const response = await axiosInstance.get<Table[]>(
        `${ApiRoutes.TABLES}?restaurantId=${restaurantId}`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося отримати столики");
    }
  },

  async create(data: {
    tableNumber: number;
    capacity: number;
    status: "free" | "reserved" | "occupied";
    restaurantId: number;
  }): Promise<Table> {
    try {
      const response = await axiosInstance.post<Table>(
        ApiRoutes.PROTECTED_TABLES,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося створити столик");
    }
  },

  async update(
    id: number,
    data: {
      tableNumber: number;
      capacity: number;
      status: "free" | "reserved" | "occupied";
      restaurantId: number;
    },
  ): Promise<Table> {
    try {
      const response = await axiosInstance.put<Table>(
        `${ApiRoutes.PROTECTED_TABLES}?tableId=${id}`,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося оновити столик");
    }
  },

  async delete(id: number): Promise<{ success: boolean }> {
    try {
      const response = await axiosInstance.delete<{ success: boolean }>(
        `${ApiRoutes.PROTECTED_TABLES}?tableId=${id}`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося видалити столик");
    }
  },

  async updateTablesStatus(
    restaurantId: number,
  ): Promise<{ success: boolean; updatedTables: Table[] }> {
    try {
      const response = await axiosInstance.post(
        `${ApiRoutes.PROTECTED_TABLES}/update-status?id=${restaurantId}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getErrorMessage(error);
      throw new Error(errMessage || "Не вдалося оновити статус столиків");
    }
  },
};
