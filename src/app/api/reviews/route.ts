import db from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { ReviewDbSchema } from "@/zod-schemas";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const {
      page = "1",
      limit = "10",
      rating,
      sort = "desc",
      userOnly,
      userId,
    } = query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return NextResponse.json(
        { error: "Некоректне значення параметра page" },
        { status: 400 },
      );
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return NextResponse.json(
        { error: "Некоректне значення параметра limit" },
        { status: 400 },
      );
    }

    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.ReviewWhereInput = {};
    if (rating && !isNaN(parseInt(rating, 10))) {
      where.rating = parseInt(rating, 10);
    }
    if (userOnly === "true" && userId) {
      where.userId = userId;
    }

    const reviews = await db.review.findMany({
      skip,
      take: limitNumber,
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        lastUpdatedAt: sort === "asc" ? "asc" : "desc",
      },
    });

    const transformedReviews = reviews.map((review) => ({
      ...review,
      user: review.users,
      users: undefined,
    }));

    const totalReviews = await db.review.count({ where });

    return NextResponse.json({
      reviews: transformedReviews,
      total: totalReviews,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
    });
  } catch (error) {
    console.error("Помилка отримання відгуків:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати відгуки" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ReviewDbSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const { userId, rating, comment } = validation.data;

    const review = await db.review.create({
      data: {
        userId,
        rating,
        comment,
        lastUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Помилка створення відгуку:", error);
    return NextResponse.json(
      { error: "Не вдалося створити відгук" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "id є обов'язковим" }, { status: 400 });
    }

    const validation = ReviewDbSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const { rating, comment } = validation.data;

    const updatedReview = await db.review.update({
      where: { id: Number(body.id) },
      data: {
        rating,
        comment,
        editedAt: new Date(),
        lastUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error("Помилка оновлення відгуку:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити відгук" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id є обов'язковим" }, { status: 400 });
    }

    await db.review.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Відгук видалено" }, { status: 200 });
  } catch (error) {
    console.error("Помилка видалення відгуку:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити відгук" },
      { status: 500 },
    );
  }
}
