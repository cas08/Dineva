import { SITE_NAME } from "@/config";
import HomePage from "@/components/main-page/home-page";
export const metadata = {
  title: `${SITE_NAME} | Головна сторінка`,
};

export default async function Home() {
  return <HomePage />;
}
