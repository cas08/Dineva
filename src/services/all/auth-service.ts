import type { SignUpFormData } from "@/@types";
import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";
import axios from "axios";

export const AuthApi = {
  async userSignUp(data: SignUpFormData): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(
        ApiRoutes.USER_REGISTRATION,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error("Цей email вже використовується");
      }
      throw new Error(getErrorMessage(error));
    }
  },
};
