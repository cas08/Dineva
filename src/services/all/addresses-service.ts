import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";
import type { Address } from "@/@types";

export const AddressesApi = {
  async getAll(): Promise<Address[]> {
    try {
      const response = await axiosInstance.get<Address[]>(ApiRoutes.ADDRESSES);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getByCity(cityId: number): Promise<Address[]> {
    try {
      const response = await axiosInstance.get<Address[]>(
        `${ApiRoutes.ADDRESSES}?cityId=${cityId}`,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data: {
    cityId: number;
    streetName: string;
    buildingNumber: string;
  }): Promise<Address> {
    try {
      const response = await axiosInstance.post<Address>(
        ApiRoutes.PROTECTED_ADDRESSES,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(
    id: number,
    data: { cityId?: number; streetName?: string; buildingNumber?: string },
  ): Promise<Address> {
    try {
      const response = await axiosInstance.patch<Address>(
        ApiRoutes.PROTECTED_ADDRESSES,
        {
          id,
          ...data,
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
        ApiRoutes.PROTECTED_ADDRESSES,
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
