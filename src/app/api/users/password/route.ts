import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import prisma from "@/lib/prisma-client";
import bcrypt from "bcryptjs";
import { changePasswordDbSchema } from "@/zod-schemas";
import { getErrorMessage } from "@/utils/error-utils";
import { z } from "zod";

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
    const { currentPassword, newPassword, userId } =
      changePasswordDbSchema.parse(body);

    if (userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Невідповідність ідентифікатора користувача",
        },
        { status: 403 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Користувача не знайдено або без пароля" },
        { status: 400 },
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Неправильний поточний пароль" },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Новий пароль має відрізнятися від поточного",
        },
        { status: 400 },
      );
    }

    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return NextResponse.json(
        {
          success: false,
          message: "Новий пароль має відрізнятися від поточного",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { success: true, message: "Пароль оновлено успішно" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Change password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Невірні дані форми" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error) || "Помилка зміни паролю",
      },
      { status: 500 },
    );
  }
}
