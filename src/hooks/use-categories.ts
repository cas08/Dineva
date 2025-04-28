import { useQuery } from "@tanstack/react-query";

import { Category } from "@prisma/client";
import { CategoriesApi } from "@/services";

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await CategoriesApi.getAll();

      if (!Array.isArray(data)) {
        console.error("categoriesData не є масивом:", data);
        return [];
      }

      return data.sort((a: Category, b: Category) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
    },
  });
};
