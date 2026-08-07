import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, SESSION_COOKIE } from "@/lib/auth";
import { eq } from "drizzle-orm";

const COLORS = ["#38bdf8", "#e879f9", "#4ade80", "#facc15", "#fb923c", "#a78bfa", "#f87171", "#2dd4bf"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (username.length < 3 || username.length > 32) {
    return NextResponse.json({ error: "Ник должен быть от 3 до 32 символов" }, { status: 400 });
  }
  if (!/^[\p{L}\p{N}_\- ]+$/u.test(username)) {
    return NextResponse.json({ error: "Ник может содержать только буквы, цифры, _ и -" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Этот ник уже занят" }, { status: 409 });
  }

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash: hashPassword(password), color })
    .returning();

  const token = await createSession(user.id);
  const res = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role, color: user.color } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
