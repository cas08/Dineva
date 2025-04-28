import { axiosInstance } from "@/lib/axios-instance";
import { ApiRoutes } from "../api-routes";
import { getErrorMessage } from "@/utils/error-utils";

export const PhotosApi = {
  async delete(imageUrl: string): Promise<void> {
    try {
      const response = await axiosInstance.delete(ApiRoutes.PHOTOS, {
        data: { imageUrl },
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async upload(photo: File): Promise<string> {
    try {
      const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };

      const base64String = await convertToBase64(photo);

      const response = await axiosInstance.post<{ imageUrl: string }>(
        ApiRoutes.PHOTOS,
        { image: base64String },
      );

      return response.data.imageUrl;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },
};
