"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toasts";

export function ViewPing({ topicId }: { topicId: number }) {
  useEffect(() => {
    fetch(`/api/topics/${topicId}/view`, { method: "POST", credentials: "include" }).catch(() => {});
  }, [topicId]);
  return null;
}

export function ReplyForm({
  topicId,
  closed,
  meId,
}: {
  topicId: number;
  closed: boolean;
  meId: number | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!meId) {
    return (
      <div className="card px-5 py-4 text-sm text-ink-300">
        Чтобы ответить в теме,{" "}
        <Link href="/login" className="text-ember-400 font-semibold hover:text-ember-300">войдите</Link>{" "}
        или{" "}
        <Link href="/register" className="text-ember-400 font-semibold hover:text-ember-300">зарегистрируйтесь</Link>.
      </div>
    );
  }

  if (closed) {
    return (
      <div className="card px-5 py-4 text-sm text-ink-400 flex items-center gap-2.5">
        Тема закрыта администрацией — новые ответы отключены.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 3) {
      setError("Сообщение слишком короткое");
      return;
    }
    setSending(true);
    setError("");
    const res = await fetch(`/api/topics/${topicId}/reply`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Не удалось отправить ответ");
      return;
    }
    setContent("");
    toast("Ответ опубликован");
    router.refresh();
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <div className="font-display text-sm tracking-wide text-ink-200 mb-3">ВАШ ОТВЕТ</div>
      <textarea
        className="field min-h-[120px] resize-y"
        placeholder="Напишите сообщение… Соблюдайте правила сервера."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={4000}
      />
      {error && <p className="mt-2 text-[13px] text-off-500">{error}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] text-ink-400">{content.length} / 4000</span>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Отправка…" : "Ответить"}
        </button>
      </div>
    </form>
  );
}
