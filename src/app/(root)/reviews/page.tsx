import ReviewsPage from "@/components/reviews/review-client";
import { SITE_NAME } from "@/config";
export const metadata = {
  title: `${SITE_NAME} | Відгуки`,
};
export default async function MenuPage() {
  return <ReviewsPage />;
}
