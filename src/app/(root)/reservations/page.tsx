import { SITE_NAME } from "@/config";
import ReservationsPageClient from "@/components/reservations/reservations-client";
export const metadata = {
  title: `${SITE_NAME} | Бронювання`,
};
export default async function ReservationsPage() {
  return <ReservationsPageClient />;
}
