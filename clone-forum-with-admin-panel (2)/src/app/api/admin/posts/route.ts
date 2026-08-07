import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, topics, users } from "@/db/schema";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const list = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      topicId: topics.id,
      topicTitle: topics.title,
      authorName: users.username,
      authorColor: users.color,
    })
    .from(posts)
    .innerJoin(topics, eq(posts.topicId, topics.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(40);

  return NextResponse.json({ posts: list });
}

export async function DELETE(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const postId = Number(body.postId);
  const [deleted] = await db.delete(posts).where(eq(posts.id, postId)).returning();
  if (!deleted) return NextResponse.json({ error: "Сообщение не найдено" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
