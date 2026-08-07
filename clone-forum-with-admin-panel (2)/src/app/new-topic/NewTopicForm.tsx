"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toasts";
import { categories } from "@/db/schema";

export default function NewTopicForm({
  user,
  cats,
}: {
  user: { id: number; username: string; color: string; role: string };
  cats: typeof categories.$inferSelect[];
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(cats[0]?.id ?? 0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 6) return setError("Заголовок — минимум 6 символов");
    if (content.trim().length < 10) return setError("Текст темы — минимум 10 символов");
    if (!categoryId) return setError("Выберите раздел");
    setSending(true); setError("");
    const res = await fetch("/api/topics", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, title: title.trim(), content: content.trim() }),
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d?.error ?? "Не удалось создать тему");
    }
    const d = await res.json();
    toast("Тема создана");
    router.push(`/topic/${d.topicId}`);
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

      <form onSubmit={submit} className="mt-5 card p-6 space-y-5">
        <div>
          <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Раздел</label>
          <select className="field" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Заголовок</label>
          <input className="field" placeholder="Коротко и по делу…" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Текст темы</label>
          <textarea className="field min-h-[220px] resize-y" placeholder="Опишите суть…" value={content} onChange={(e) => setContent(e.target.value)} maxLength={6000} />
        </div>
        {error && <p className="text-[13px] text-off-500">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <Link href="/" className="btn btn-ghost">Отмена</Link>
          <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? "Публикация…" : "Опубликовать тему"}</button>
        </div>
      </form>
    </div>
  );
}
