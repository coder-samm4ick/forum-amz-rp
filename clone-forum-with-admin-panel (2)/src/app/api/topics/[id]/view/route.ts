import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { topics } from "@/db/schema";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicId = Number(id);
  if (!Number.isFinite(topicId)) return NextResponse.json({ ok: false }, { status: 400 });
  await db.update(topics).set({ views: sql`${topics.views} + 1` }).where(eq(topics.id, topicId));
  return NextResponse.json({ ok: true });
}
