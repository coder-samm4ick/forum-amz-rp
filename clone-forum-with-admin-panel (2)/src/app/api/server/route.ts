import { NextResponse } from "next/server";
import { db } from "@/db";
import { gameServer } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const server = (await db.select().from(gameServer).limit(1))[0] ?? null;
  return NextResponse.json({ server });
}
