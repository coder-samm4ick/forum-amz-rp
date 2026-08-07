import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, topics } from "@/db/schema";
import { requireOwner } from "@/lib/auth";
import { ICON_KEYS } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const list = await db
    .select({
      category: categories,
      topicCount: sql<number>`count(${topics.id})::int`,
    })
    .from(categories)
    .leftJoin(topics, eq(topics.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
  return NextResponse.json({ categories: list });
}

export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim().slice(0, 200);
  const icon = ICON_KEYS.includes(String(body.icon)) ? String(body.icon) : "folder";
  if (name.length < 3 || name.length > 60) {
    return NextResponse.json({ error: "Название раздела — от 3 до 60 символов" }, { status: 400 });
  }

  const [maxRow] = await db
    .select({ max: sql<number>`COALESCE(MAX(${categories.sortOrder}), 0)` })
    .from(categories);

  const [created] = await db
    .insert(categories)
    .values({ name, description, icon, sortOrder: (maxRow?.max ?? 0) + 1 })
    .returning();

  return NextResponse.json({ category: created });
}

export async function PATCH(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);

  if (body.direction === "up" || body.direction === "down") {
    const all = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id));
    const idx = all.findIndex((c) => c.id === id);
    const swapIdx = body.direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= all.length) {
      return NextResponse.json({ error: "Нельзя переместить" }, { status: 400 });
    }
    const a = all[idx];
    const b = all[swapIdx];
    await db.update(categories).set({ sortOrder: b.sortOrder }).where(eq(categories.id, a.id));
    await db.update(categories).set({ sortOrder: a.sortOrder }).where(eq(categories.id, b.id));
    return NextResponse.json({ ok: true });
  }

  const patch: { name?: string; description?: string; icon?: string } = {};
  if (typeof body.name === "string" && body.name.trim().length >= 3) patch.name = body.name.trim().slice(0, 60);
  if (typeof body.description === "string") patch.description = body.description.trim().slice(0, 200);
  if (typeof body.icon === "string" && ICON_KEYS.includes(body.icon)) patch.icon = body.icon;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const [updated] = await db.update(categories).set(patch).where(eq(categories.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Раздел не найден" }, { status: 404 });
  return NextResponse.json({ category: updated });
}

export async function DELETE(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: "Раздел не найден" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
