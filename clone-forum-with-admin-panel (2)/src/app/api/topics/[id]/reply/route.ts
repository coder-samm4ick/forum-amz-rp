import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, topics } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicId = Number(id);

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  const [topic] = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);
  if (!topic) return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
  if (topic.closed) return NextResponse.json({ error: "Тема закрыта" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();
  if (content.length < 3 || content.length > 4000) {
    return NextResponse.json({ error: "Сообщение — от 3 до 4000 символов" }, { status: 400 });
  }

  const [post] = await db
    .insert(posts)
    .values({ topicId, authorId: user.id, content })
    .returning();

  return NextResponse.json({ postId: post.id });
}
