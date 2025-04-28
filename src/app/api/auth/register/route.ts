import { NextResponse, NextRequest } from "next/server";
import { SignUpSchema } from "@/zod-schemas";
import type { SignUpFormData } from "@/@types";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma-client";
import { getErrorMessage } from "@/utils/error-utils";

export async function POST(req: NextRequest) {
  try {
    const body: SignUpFormData = await req.json();
    const validatedData = SignUpSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Цей email вже використовується" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    await prisma.user.create({
      data: {
        name: validatedData.name,
        surname: validatedData.surname || null,
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: validatedData.phoneNumber || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Користувач зареєстрований!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error) || "Сталася помилка при реєстрації",
      },
      { status: 500 },
    );
  }
}
