import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
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
      id: users.id,
      username: users.username,
      role: users.role,
      color: users.color,
      banned: users.banned,
      banReason: users.banReason,
      createdAt: users.createdAt,
      postCount: sql<number>`count(${posts.id})::int`,
      topicCount: sql<number>`count(distinct ${topics.id})::int`,
    })
    .from(users)
    .leftJoin(posts, eq(posts.authorId, users.id))
    .leftJoin(topics, eq(topics.authorId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ users: list });
}

export async function PATCH(req: Request) {
  const owner = await requireOwner().catch(() => null);
  if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const userId = Number(body.userId);
  const banned = Boolean(body.banned);
  const banReason = String(body.banReason ?? "").slice(0, 200);

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "Владелец не может быть заблокирован" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ banned, banReason: banned ? banReason : "" })
    .where(eq(users.id, userId))
    .returning();

  return NextResponse.json({ user: { id: updated.id, banned: updated.banned, banReason: updated.banReason } });
}
