import MenuPageClient from "@/components/menu/menu-client";
import { SITE_NAME } from "@/config";
export const metadata = {
  title: `${SITE_NAME} | Меню`,
};
export default async function MenuPage() {
  return <MenuPageClient />;
}
