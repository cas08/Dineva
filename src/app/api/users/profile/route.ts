import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { z } from "zod";
import { auth } from "@/lib/auth-options";
import bcrypt from "bcryptjs";
import { DeleteAccountDbSchema, UpdateUserSchema } from "@/zod-schemas";
import { getErrorMessage } from "@/utils/error-utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Неавторизований доступ" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phoneNumber: true,
        userRole: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Користувача не знайдено" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, message: "Сталася помилка" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Неавторизований доступ" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const validatedData = UpdateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        surname: validatedData.surname,
        phoneNumber: validatedData.phoneNumber,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phoneNumber: true,
        userRole: true,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Update user profile error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Невірні дані" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Сталася помилка" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Неавторизований доступ" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const { password, confirmation, cancelFutureReservations } =
      DeleteAccountDbSchema.parse(body);

    if (confirmation !== "ВИДАЛИТИ") {
      return NextResponse.json(
        { success: false, message: "Невірне підтвердження" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Користувача не знайдено" },
        { status: 404 },
      );
    }

    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "Потрібен пароль для підтвердження" },
          { status: 400 },
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Неправильний пароль" },
          { status: 400 },
        );
      }
    }

    if (cancelFutureReservations) {
      await prisma.reservation.updateMany({
        where: {
          userId: session.user.id,
          status: "active",
        },
        data: {
          status: "cancelled",
        },
      });
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Акаунт успішно видалено",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Невірні дані" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error) || "Помилка видалення акаунту",
      },
      { status: 500 },
    );
  }
}
