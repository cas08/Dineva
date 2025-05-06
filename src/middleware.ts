import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import { verifyUserExists, getUserCurrentRole } from "@/utils/verify-user";

export async function middleware(req: NextRequest) {
  try {
    const { pathname, searchParams } = req.nextUrl;

    if (pathname === "/auth/error") {
      const allowed = searchParams.get("fromRedirect") === "true";

      if (!allowed) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    }

    if (pathname === "/api/reservations/available") {
      return NextResponse.next();
    }

    if (pathname === "/sign-in") {
      const isSessionExpired = searchParams.get("session") === "expired";
      const isRefreshNeeded = searchParams.get("refresh") === "true";

      if (isSessionExpired || isRefreshNeeded) {
        return NextResponse.next();
      }
    }

    const session = await auth();

    if (pathname === "/sign-in" && !session?.user) {
      return NextResponse.next();
    }

    if (
      pathname.startsWith("/reservations") &&
      pathname !== "/reservations/by-user"
    ) {
      return NextResponse.next();
    }

    const userExists = session?.user?.id
      ? await verifyUserExists(session.user.id)
      : false;
    const isAuth = !!session?.user && userExists;

    if (session?.user?.id && !userExists) {
      if (pathname === "/api/reservations") {
        return NextResponse.json(
          { error: "Користувач більше не існує", requireLogout: true },
          { status: 401 },
        );
      }

      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Користувач більше не існує" },
          { status: 401 },
        );
      }

      return NextResponse.redirect(
        new URL("/sign-in?session=expired", req.url),
      );
    }

    if (isAuth) {
      const currentRole = await getUserCurrentRole(session.user.id);
      const tokenRole = session.user.role || "";

      if (currentRole && tokenRole !== currentRole) {
        if (pathname === "/api/reservations") {
          return NextResponse.json(
            {
              error: "Роль користувача змінилася",
              requireLogout: true,
              requireRefresh: true,
            },
            { status: 403 },
          );
        }

        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Роль користувача змінилася", requireRefresh: true },
            { status: 403 },
          );
        }

        return NextResponse.redirect(
          new URL("/api/auth/session-refresh", req.url),
        );
      }

      if (["/sign-in", "/sign-up", "/google-sign-in"].includes(pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (
      (pathname.startsWith("/profile") ||
        pathname === "/reservations/by-user") &&
      !isAuth
    ) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (pathname === "/api/reservations" && req.method === "POST") {
      if (session?.user?.id) {
        if (!isAuth) {
          return NextResponse.json(
            {
              error: "Користувач більше не існує",
              requireLogout: true,
            },
            { status: 401 },
          );
        }
      } else {
        return NextResponse.next();
      }
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isProtectedApi = pathname.startsWith("/api/protected");

    if (
      (isAdminRoute || isProtectedApi) &&
      (!isAuth ||
        !["Admin", "Manager"].includes(
          (await getUserCurrentRole(session?.user?.id)) || "",
        ))
    ) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: isAuth ? "Forbidden access" : "Unauthorized access" },
          { status: isAuth ? 403 : 401 },
        );
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/google-sign-in",
    "/profile",
    "/reservations/by-user",
    "/reviews",
    "/admin/:path*",
    "/api/reservations/:path*",
    "/api/protected/:path*",
    "/auth/error",
  ],
};
