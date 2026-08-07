import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { topics, users } from "@/db/schema";
import { requireOwner } from "@/lib/auth";
import { getForumStats, getLatestPosts } from "@/lib/forum";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [stats, latest, recentUsers, recentTopics] = await Promise.all([
    getForumStats(),
    getLatestPosts(6),
    db.select({ id: users.id, username: users.username, color: users.color, createdAt: users.createdAt, banned: users.banned }).from(users).orderBy(desc(users.createdAt)).limit(5),
    db.select({ id: topics.id, title: topics.title, views: topics.views, createdAt: topics.createdAt }).from(topics).orderBy(desc(topics.createdAt)).limit(5),
  ]);

  return NextResponse.json({ stats, latest, recentUsers, recentTopics });
}
