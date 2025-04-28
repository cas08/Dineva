import { SignUpForm } from "@/components/auth";
import { SITE_NAME } from "@/config";
import { auth } from "@/lib/auth-options";
import { redirect } from "next/navigation";
export const metadata = {
  title: `${SITE_NAME} | Реєстрація`,
};
export default async function Page() {
  const session = await auth();
  if (session) redirect("/");
  return <SignUpForm />;
}
