"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconLock, IconPin } from "@/components/Icons";
import { toast } from "@/components/Toasts";
import { adminFetch, DangerConfirm, PanelTitle } from "../kit";

type TopicRow = {
  id: number;
  title: string;
  pinned: boolean;
  closed: boolean;
  views: number;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  authorName: string;
  replyCount: number;
};
type Cat = { id: number; name: string };

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [catFilter, setCatFilter] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (cat: number) => {
    setLoading(true);
    const d = await adminFetch(`/api/admin/topics?cat=${cat}`);
    setTopics(d.topics);
    setLoading(false);
  }, []);

  useEffect(() => {
    adminFetch("/api/categories").then((d: { categories: Cat[] }) => setCats(d.categories));
    load(0);
  }, [load]);

  async function patchTopic(topicId: number, patch: { pinned?: boolean; closed?: boolean }) {
    const d = await adminFetch("/api/admin/topics", { method: "PATCH", body: JSON.stringify({ topicId, ...patch }) });
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, ...d.topic } : t)));
    if (patch.pinned !== undefined) toast(patch.pinned ? "Тема закреплена" : "Тема откреплена");
    if (patch.closed !== undefined) toast(patch.closed ? "Тема закрыта" : "Тема открыта");
  }

  async function deleteTopic(topicId: number) {
    await adminFetch("/api/admin/topics", { method: "DELETE", body: JSON.stringify({ topicId }) });
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
    toast("Тема удалена вместе с сообщениями");
  }

  return (
    <div className="space-y-5 rise-in">
      <PanelTitle>ТЕМЫ — МОДЕРАЦИЯ</PanelTitle>

      <select
        className="field max-w-xs"
        value={catFilter}
        onChange={(e) => {
          const v = Number(e.target.value);
          setCatFilter(v);
          load(v);
        }}
      >
        <option value={0}>Все разделы</option>
        {cats.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {loading ? (
        <div className="card p-6 text-ink-400 animate-pulse">Загрузка…</div>
      ) : (
        <div className="space-y-3">
          {topics.map((t) => (
            <div key={t.id} className="card p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <Link href={`/topic/${t.id}`} className="block font-semibold text-[15px] text-ink-100 hover:text-ember-300 transition-colors truncate">
                  {t.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-400">
                  <span className="text-ink-300">{t.categoryName}</span>
                  <span>· {t.authorName}</span>
                  <span>· {t.replyCount - 1 > 0 ? t.replyCount - 1 : 0} отв.</span>
                  <span>· {t.views} просм.</span>
                  <span>· {new Date(t.createdAt).toLocaleDateString("ru-RU")}</span>
                  {t.pinned && <span className="text-gold-500 font-semibold inline-flex items-center gap-1"><IconPin className="w-3.5 h-3.5" />закреплена</span>}
                  {t.closed && <span className="inline-flex items-center gap-1"><IconLock className="w-3.5 h-3.5" />закрыта</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => patchTopic(t.id, { pinned: !t.pinned })}
                  className={`btn !px-3 !py-1.5 !text-[12px] ${t.pinned ? "btn-primary" : "btn-ghost"}`}
                >
                  <IconPin className="w-3.5 h-3.5" /> {t.pinned ? "Открепить" : "Закрепить"}
                </button>
                <button
                  onClick={() => patchTopic(t.id, { closed: !t.closed })}
                  className={`btn !px-3 !py-1.5 !text-[12px] ${t.closed ? "btn-primary" : "btn-ghost"}`}
                >
                  <IconLock className="w-3.5 h-3.5" /> {t.closed ? "Открыть" : "Закрыть"}
                </button>
                <DangerConfirm small onConfirm={() => deleteTopic(t.id)} />
              </div>
            </div>
          ))}
          {topics.length === 0 && <div className="card p-8 text-center text-ink-400">Тем не найдено</div>}
        </div>
      )}
    </div>
  );
}
