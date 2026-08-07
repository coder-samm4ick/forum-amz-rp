import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await db.select().from(categories).orderBy(categories.sortOrder, categories.id);
  return NextResponse.json({ categories: list });
}
