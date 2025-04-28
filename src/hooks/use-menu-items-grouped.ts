import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@prisma/client";
import { MenuItemsApi } from "@/services";

type MenuItemWithCategory = MenuItem & { categoryName: string };

interface GroupedMenuItems {
  category: string;
  items: MenuItemWithCategory[];
}

export const useMenuItemsGrouped = () => {
  return useQuery<GroupedMenuItems[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const data = await MenuItemsApi.getAll();

      if (!Array.isArray(data)) {
        console.error("menuItemsData не є масивом:", data);
        return [];
      }

      return data.sort((a, b) =>
        a.category.toLowerCase().localeCompare(b.category.toLowerCase()),
      );
    },
  });
};
