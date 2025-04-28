import { SITE_NAME } from "@/config";
import ReservationsManagementPage from "@/components/admin/reservations/admin-reservarions";
export const metadata = {
  title: `${SITE_NAME} | Усі бронювання`,
};
export default async function MenuPage() {
  return <ReservationsManagementPage />;
}
