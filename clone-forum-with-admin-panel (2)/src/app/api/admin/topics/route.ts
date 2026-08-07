import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts, topics, users } from "@/db/schema";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const categoryId = Number(url.searchParams.get("cat")) || 0;

  const list = await db
    .select({
      id: topics.id,
      title: topics.title,
      pinned: topics.pinned,
      closed: topics.closed,
      views: topics.views,
      createdAt: topics.createdAt,
      categoryId: categories.id,
      categoryName: categories.name,
      authorName: users.username,
      replyCount: sql<number>`count(${posts.id})::int`,
    })
    .from(topics)
    .innerJoin(categories, eq(topics.categoryId, categories.id))
    .innerJoin(users, eq(topics.authorId, users.id))
    .leftJoin(posts, eq(posts.topicId, topics.id))
    .where(categoryId ? eq(topics.categoryId, categoryId) : undefined)
    .groupBy(topics.id, categories.id, users.username)
    .orderBy(desc(topics.createdAt))
    .limit(100);

  return NextResponse.json({ topics: list });
}

export async function PATCH(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const topicId = Number(body.topicId);
  const patch: { pinned?: boolean; closed?: boolean } = {};
  if (typeof body.pinned === "boolean") patch.pinned = body.pinned;
  if (typeof body.closed === "boolean") patch.closed = body.closed;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const [updated] = await db.update(topics).set(patch).where(eq(topics.id, topicId)).returning();
  if (!updated) return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
  return NextResponse.json({ topic: updated });
}

export async function DELETE(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const topicId = Number(body.topicId);
  const [deleted] = await db.delete(topics).where(eq(topics.id, topicId)).returning();
  if (!deleted) return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
