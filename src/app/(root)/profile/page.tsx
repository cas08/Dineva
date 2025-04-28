import { SITE_NAME } from "@/config";
import ProfilePageClient from "@/components/profile/user-profile";
export const metadata = {
  title: `${SITE_NAME} | Профіль`,
};
export default async function ProfilePage() {
  return <ProfilePageClient />;
}
