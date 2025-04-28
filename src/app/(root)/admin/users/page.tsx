import { SITE_NAME } from "@/config";
import UsersManagementPage from "@/components/admin/users/users-client";
export const metadata = {
  title: `${SITE_NAME} | Управління користувачами`,
};

export default async function Page() {
  return <UsersManagementPage />;
}
