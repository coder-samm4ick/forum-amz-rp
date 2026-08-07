import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gameServer } from "@/db/schema";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const server = (await db.select().from(gameServer).limit(1))[0] ?? null;
  return NextResponse.json({ server });
}

export async function PATCH(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const server = (await db.select().from(gameServer).limit(1))[0];
  if (!server) return NextResponse.json({ error: "Сервер не найден" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  if (body.action === "restart") {
    const [updated] = await db
      .update(gameServer)
      .set({ startedAt: new Date(), restarts: server.restarts + 1, online: true })
      .where(eq(gameServer.id, server.id))
      .returning();
    return NextResponse.json({ server: updated });
  }

  const patch: Partial<typeof gameServer.$inferInsert> = {};
  if (typeof body.online === "boolean") patch.online = body.online;
  if (typeof body.players === "number") {
    patch.players = Math.max(0, Math.min(body.maxPlayers ?? server.maxPlayers, Math.round(body.players)));
  }
  if (typeof body.maxPlayers === "number") {
    patch.maxPlayers = Math.max(10, Math.min(2000, Math.round(body.maxPlayers)));
  }
  if (typeof body.motd === "string") patch.motd = body.motd.slice(0, 300);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const [updated] = await db.update(gameServer).set(patch).where(eq(gameServer.id, server.id)).returning();
  return NextResponse.json({ server: updated });
}
