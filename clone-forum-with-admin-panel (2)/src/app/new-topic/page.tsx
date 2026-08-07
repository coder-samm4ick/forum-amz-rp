import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { categories, posts, topics, users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewTopicPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("ph_session")?.value ?? null;
  let user = null;
  if (sessionToken) {
    const rows = await db.select({ user: users, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, sessionToken))
      .limit(1);
    const row = rows[0];
    if (row && new Date(row.expiresAt).getTime() > Date.now() && !row.user.banned) {
      user = row.user;
    }
  }
  if (!user) redirect("/login");

  const cats = await db.select().from(categories).orderBy(categories.sortOrder, categories.id);
  const formCat = Number(cookieStore.get("new_topic_cat")?.value) || (cats[0]?.id ?? 0);

  async function create(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("ph_session")?.value ?? null;
    if (!sessionToken) redirect("/login");
    const rows = await db.select({ user: users, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, sessionToken))
      .limit(1);
    const session = rows[0];
    if (!session || new Date(session.expiresAt).getTime() < Date.now() || session.user.banned) redirect("/login");

    const categoryId = Number(formData.get("categoryId"));
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    if (title.length < 6 || content.length < 10) redirect("/new-topic?error=bad");

    const [catRow] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!catRow) redirect("/new-topic");
    const [topic] = await db.insert(topics).values({ categoryId, authorId: session.user.id, title }).returning();
    await db.insert(posts).values({ topicId: topic.id, authorId: session.user.id, content });
    redirect(`/topic/${topic.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mt-6 text-[13px] text-ink-400">
        <Link href="/" className="hover:text-ember-300 transition-colors">Форум</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-200">Новая тема</span>
      </div>
      <h1 className="mt-3 font-display text-2xl md:text-3xl tracking-wide text-ink-100">НОВАЯ ТЕМА</h1>
      <div className="mt-2 text-[13px] text-ink-300">От {user.username}</div>
      <form action={create} className="mt-5 card p-6 space-y-5">
        <div>
          <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Раздел</label>
          <select name="categoryId" defaultValue={formCat} className="field">
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Заголовок</label>
          <input name="title" className="field" placeholder="Коротко и по делу…" maxLength={140} required />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Текст темы</label>
          <textarea name="content" className="field min-h-[220px] resize-y" placeholder="Опишите суть…" maxLength={6000} required />
        </div>
        <div className="flex items-center justify-end gap-3">
          <Link href="/" className="btn btn-ghost">Отмена</Link>
          <button type="submit" className="btn btn-primary">Опубликовать тему</button>
        </div>
      </form>
    </div>
  );
}
