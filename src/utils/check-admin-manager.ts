import { auth } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function checkAdminOrManager() {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json(
        { message: "Неавторизований доступ" },
        { status: 401 },
      ),
    };
  }

  const role = session.user.role;

  if (role !== "Admin" && role !== "Manager") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Недостатньо прав" },
        { status: 403 },
      ),
    };
  }

  return { success: true, session };
}
