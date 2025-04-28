import type { ExtendedReview } from "@/@types";
import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";

export const ReviewsApi = {
  async get({
    page = 1,
    limit = 10,
    rating,
    sort = "desc",
    userOnly = false,
    userId,
  }: {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: "asc" | "desc";
    userOnly?: boolean;
    userId?: string;
  }): Promise<{
    reviews: ExtendedReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();

      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sort", sort);

      if (rating !== undefined) {
        params.append("rating", rating.toString());
      }
      if (userOnly && userId) {
        params.append("userOnly", "true");
        params.append("userId", userId);
      }

      const response = await axiosInstance.get(
        `${ApiRoutes.REVIEWS}?${params.toString()}`,
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Не вдалося отримати відгуки:", getErrorMessage(error));
      return {
        reviews: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  },

  async create(data: { userId: string; rating: number; comment?: string }) {
    try {
      const response = await axiosInstance.post(ApiRoutes.REVIEWS, data);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося створити відгук");
    }
  },

  async update(data: { id: number; rating?: number; comment?: string }) {
    try {
      const response = await axiosInstance.put(ApiRoutes.REVIEWS, data);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося оновити відгук");
    }
  },

  async delete(id: number) {
    try {
      const response = await axiosInstance.delete(ApiRoutes.REVIEWS, {
        data: { id },
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error) || "Не вдалося видалити відгук");
    }
  },
};
