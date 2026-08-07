"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { toast } from "@/components/Toasts";
import { adminFetch, PanelTitle } from "../kit";

type UserRow = {
  id: number;
  username: string;
  role: string;
  color: string;
  banned: boolean;
  banReason: string;
  createdAt: string;
  postCount: number;
  topicCount: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [reasonFor, setReasonFor] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/users")
      .then((d: { users: UserRow[] }) => setUsers(d.users))
      .finally(() => setLoading(false));
  }, []);

  async function setBan(u: UserRow, banned: boolean, banReason = "") {
    const d = await adminFetch("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({ userId: u.id, banned, banReason }),
    });
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, banned: d.user.banned, banReason: d.user.banReason } : x)),
    );
    toast(banned ? `Игрок ${u.username} заблокирован` : `Игрок ${u.username} разблокирован`);
    setReasonFor(null);
    setReason("");
  }

  const filtered = users.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5 rise-in">
      <PanelTitle>ПОЛЬЗОВАТЕЛИ — {users.length}</PanelTitle>

      <input
        className="field max-w-xs"
        placeholder="Поиск по нику…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <div className="card p-6 text-ink-400 animate-pulse">Загрузка…</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-850 text-[11px] uppercase tracking-wider text-ink-400">
                <th className="text-left px-4 py-3 font-bold">Игрок</th>
                <th className="text-left px-4 py-3 font-bold">Роль</th>
                <th className="text-left px-4 py-3 font-bold">Активность</th>
                <th className="text-left px-4 py-3 font-bold">Регистрация</th>
                <th className="text-right px-4 py-3 font-bold">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/70">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-ink-800/50 transition-colors align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} color={u.color} size={34} />
                      <div>
                        <div className="font-semibold" style={{ color: u.color }}>{u.username}</div>
                        {u.banned && u.banReason && (
                          <div className="text-[11px] text-off-500 mt-0.5">причина: {u.banReason}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "owner" ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-300 border border-gold-500/40">
                        Владелец
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-700/70 text-ink-300 border border-ink-600">
                        Игрок
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink-300">
                    {u.topicCount} тем · {u.postCount} сообщений
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink-400">
                    {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role === "owner" ? (
                      <span className="text-[12px] text-ink-400 italic">недоступно</span>
                    ) : u.banned ? (
                      <button onClick={() => setBan(u, false)} className="btn btn-ghost !px-3 !py-1.5 !text-[12px]">
                        Разбанить
                      </button>
                    ) : reasonFor === u.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <input
                          className="field !w-44 !py-1.5 !text-[12px]"
                          placeholder="Причина бана"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => setBan(u, true, reason.trim() || "Нарушение правил")}
                          className="btn btn-danger !px-3 !py-1.5 !text-[12px]"
                        >
                          Забанить
                        </button>
                        <button
                          onClick={() => setReasonFor(null)}
                          className="text-[12px] text-ink-400 hover:text-ink-200"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setReasonFor(u.id); setReason(""); }}
                        className="btn btn-danger !px-3 !py-1.5 !text-[12px]"
                      >
                        Забанить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
