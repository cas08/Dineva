import db from "@/lib/prisma-client";
import { NextResponse } from "next/server";
export async function GET() {
  const categories = await db.category.findMany();
  return NextResponse.json(categories);
}
