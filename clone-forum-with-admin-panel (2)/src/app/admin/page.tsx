"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { adminFetch, PanelTitle, StatCard } from "./kit";

type StatsData = {
  stats: { users: number; topics: number; posts: number; server: { online: boolean; players: number; maxPlayers: number; name: string } | null };
  recentUsers: { id: number; username: string; color: string; createdAt: string; banned: boolean }[];
  recentTopics: { id: number; title: string; views: number; createdAt: string }[];
  latest: { postId: number; topicId: number; topicTitle: string; authorName: string; authorColor: string; createdAt: string }[];
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card p-6 text-off-500">{error}</div>;
  if (!data) return <div className="card p-6 text-ink-400 animate-pulse">Загрузка статистики…</div>;

  const { stats } = data;

  return (
    <div className="space-y-6 rise-in">
      <PanelTitle>ОБЗОР ПРОЕКТА</PanelTitle>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Игроки" value={stats.users} accent="#38bdf8" hint="зарегистрировано на форуме" />
        <StatCard label="Темы" value={stats.topics} accent="#ff5c39" hint="во всех разделах" />
        <StatCard label="Сообщения" value={stats.posts} accent="#f5a623" hint="написано игроками" />
        <StatCard
          label={`Сервер «${stats.server?.name ?? "Чёрный"}»`}
          value={stats.server ? `${stats.server.online ? stats.server.players : 0}/${stats.server.maxPlayers}` : "—"}
          accent="#2fd46b"
          hint={stats.server?.online ? "сервер в сети" : "сервер остановлен"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-700 bg-ink-850 font-display text-[13px] tracking-wide text-ink-200">
            НОВЫЕ ИГРОКИ
          </div>
          <ul className="divide-y divide-ink-700/70">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar name={u.username} color={u.color} size={30} />
                <span className="text-sm font-semibold truncate">{u.username}</span>
                {u.banned && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-off-500/15 text-off-500 border border-off-500/40">
                    бан
                  </span>
                )}
                <span className="ml-auto text-[12px] text-ink-400">{fmt(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-700 bg-ink-850 font-display text-[13px] tracking-wide text-ink-200">
            СВЕЖИЕ ТЕМЫ
          </div>
          <ul className="divide-y divide-ink-700/70">
            {data.recentTopics.map((t) => (
              <li key={t.id}>
                <Link href={`/topic/${t.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-800/60 transition-colors group">
                  <span className="text-sm text-ink-200 truncate group-hover:text-ember-300 transition-colors">{t.title}</span>
                  <span className="ml-auto text-[12px] text-ink-400 shrink-0">{t.views} просм. · {fmt(t.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-ink-700 bg-ink-850 font-display text-[13px] tracking-wide text-ink-200">
          ПОСЛЕДНЯЯ АКТИВНОСТЬ
        </div>
        <ul className="divide-y divide-ink-700/70">
          {data.latest.map((p) => (
            <li key={p.postId}>
              <Link href={`/topic/${p.topicId}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-800/60 transition-colors">
                <Avatar name={p.authorName} color={p.authorColor} size={26} />
                <span className="text-sm truncate">
                  <b>{p.authorName}</b> <span className="text-ink-400">ответил в</span>{" "}
                  <span className="text-ink-200">{p.topicTitle}</span>
                </span>
                <span className="ml-auto text-[12px] text-ink-400 shrink-0">{fmt(p.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
