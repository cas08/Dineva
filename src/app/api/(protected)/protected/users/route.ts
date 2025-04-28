import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import prisma from "@/lib/prisma-client";
import { Prisma, UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 },
      );
    }

    const userRole = session.user.role;

    if (userRole !== "Admin" && userRole !== "Manager") {
      return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
    }

    const whereClause: Prisma.UserWhereInput = {};

    if (role) {
      whereClause.userRole = role as UserRole;
    }

    if (userRole === "Manager") {
      whereClause.userRole = "User";
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        userRole: true,
        createdAt: true,
        phoneNumber: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати список користувачів" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "ID користувача обов'язковий" },
        { status: 400 },
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 },
      );
    }

    const userRole = session.user.role;

    if (userRole !== "Admin" && userRole !== "Manager") {
      return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
    }

    const body = await req.json();
    const { cancelReservations } = body;

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { userRole: true },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 404 },
      );
    }

    if (userToDelete.userRole !== "User" && userRole !== "Admin") {
      return NextResponse.json(
        { error: "У вас немає прав для видалення цього користувача" },
        { status: 403 },
      );
    }

    if (cancelReservations) {
      await prisma.reservation.deleteMany({
        where: {
          userId: userId,
          status: "active",
        },
      });
    }

    await prisma.account.deleteMany({
      where: { userId },
    });

    await prisma.session.deleteMany({
      where: { userId },
    });

    await prisma.review.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Користувача успішно видалено" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити користувача" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");
    const action = searchParams.get("action");

    if (!userId || !action) {
      return NextResponse.json(
        { error: "ID користувача та дія обов'язкові" },
        { status: 400 },
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 },
      );
    }

    const userRole = session.user.role;

    if (userRole !== "Admin") {
      return NextResponse.json(
        { error: "У вас немає прав для цієї операції" },
        { status: 403 },
      );
    }

    if (action === "promote") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { userRole: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Користувача не знайдено" },
          { status: 404 },
        );
      }

      if (user.userRole !== "User") {
        return NextResponse.json(
          { error: "Цей користувач вже має роль менеджера або адміністратора" },
          { status: 400 },
        );
      }

      await prisma.user.update({
        where: { id: userId },
        data: { userRole: "Manager" },
      });

      return NextResponse.json({
        message: "Користувача успішно призначено менеджером",
      });
    }

    return NextResponse.json({ error: "Непідтримувана дія" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити користувача" },
      { status: 500 },
    );
  }
}
