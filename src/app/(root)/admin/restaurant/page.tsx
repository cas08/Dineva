import RestaurantClient from "@/components/restaurant/restaurant-client";
import { SITE_NAME } from "@/config";
export const metadata = {
  title: `${SITE_NAME} | Управління рестораном`,
};
export default async function MenuPage() {
  return <RestaurantClient />;
}
