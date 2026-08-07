import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts, topics } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const categoryId = Number(body.categoryId);
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();

  if (title.length < 6 || title.length > 140) {
    return NextResponse.json({ error: "Заголовок — от 6 до 140 символов" }, { status: 400 });
  }
  if (content.length < 10 || content.length > 6000) {
    return NextResponse.json({ error: "Текст темы — от 10 до 6000 символов" }, { status: 400 });
  }

  const cat = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (cat.length === 0) return NextResponse.json({ error: "Раздел не найден" }, { status: 404 });

  const [topic] = await db
    .insert(topics)
    .values({ categoryId, authorId: user.id, title })
    .returning();

  await db.insert(posts).values({ topicId: topic.id, authorId: user.id, content });

  return NextResponse.json({ topicId: topic.id });
}
