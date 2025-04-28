import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getErrorMessage } from "@/utils/error-utils";
import { CloudinaryUploadResponse } from "@/@types";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUD_API_KEY!,
  api_secret: process.env.CLOUD_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body: { image: string } = await req.json();
    if (!body.image) {
      return NextResponse.json(
        { error: "Зображення (base64) є обов'язковим" },
        { status: 400 },
      );
    }

    const uploadResult = await uploadImage(body.image, "menu-photos");

    return NextResponse.json(
      {
        message: "Зображення успішно завантажено",
        imageUrl: uploadResult.secure_url,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);
    return NextResponse.json(
      { error: `Не вдалося завантажити зображення: ${getErrorMessage(error)}` },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body: {
      imageUrl: string;
    } = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json(
        { error: "URL зображення є обов'язковим" },
        { status: 400 },
      );
    }

    const publicId = extractPublicId(body.imageUrl);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok") {
      throw new Error("Не вдалося видалити зображення");
    }

    return NextResponse.json(
      { message: "Зображення успішно видалено" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Помилка видалення зображення:", error);
    return NextResponse.json(
      { error: `Не вдалося видалити зображення: ${getErrorMessage(error)}` },
      { status: 500 },
    );
  }
}

async function uploadImage(
  base64Image: string,
  folder?: string,
): Promise<CloudinaryUploadResponse> {
  try {
    return await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "image",
      format: "jpg",
    });
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);
    throw new Error(
      `Не вдалося завантажити зображення: ${getErrorMessage(error)}`,
    );
  }
}

function extractPublicId(imageUrl: string): string {
  const urlParts = imageUrl.split("/");
  const fileNameWithExtension = urlParts.pop() || "";
  const fileName = fileNameWithExtension.split(".")[0];
  const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
  const folderPath = urlParts.slice(versionIndex + 1).join("/");
  return `${folderPath}/${fileName}`;
}
