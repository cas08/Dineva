import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import db from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        needsRefresh: true,
        reason: "no-session",
      });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, userRole: true },
    });

    if (!user) {
      return NextResponse.json({
        needsRefresh: true,
        reason: "expired",
      });
    }

    if (user.userRole !== session.user.role) {
      return NextResponse.json({
        needsRefresh: true,
        reason: "role-changed",
        currentRole: user.userRole,
        sessionRole: session.user.role,
      });
    }

    return NextResponse.json({
      needsRefresh: false,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      {
        needsRefresh: true,
        reason: "error",
        error: "Помилка перевірки сесії",
      },
      { status: 500 },
    );
  }
}
