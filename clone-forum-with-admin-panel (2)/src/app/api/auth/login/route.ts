import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, SESSION_COOKIE, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!username || !password) {
    return NextResponse.json({ error: "Введите ник и пароль" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Неверный ник или пароль" }, { status: 401 });
  }
  if (user.banned) {
    return NextResponse.json(
      { error: user.banReason ? `Аккаунт заблокирован: ${user.banReason}` : "Аккаунт заблокирован администрацией" },
      { status: 403 },
    );
  }

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
