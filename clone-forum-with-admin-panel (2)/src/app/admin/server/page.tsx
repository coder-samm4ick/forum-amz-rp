"use client";

import { useEffect, useState } from "react";
import { IconRestart, IconServer } from "@/components/Icons";
import { toast } from "@/components/Toasts";
import { adminFetch, DangerConfirm, PanelTitle, Toggle } from "../kit";

type Server = {
  id: number;
  name: string;
  address: string;
  online: boolean;
  players: number;
  maxPlayers: number;
  motd: string;
  startedAt: string;
  restarts: number;
};

function uptimeParts(startedAt: string) {
  const ms = Math.max(0, Date.now() - new Date(startedAt).getTime());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

export default function AdminServerPage() {
  const [server, setServer] = useState<Server | null>(null);
  const [motd, setMotd] = useState("");
  const [players, setPlayers] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(500);
  const [saving, setSaving] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    adminFetch("/api/admin/server").then((d: { server: Server }) => {
      setServer(d.server);
      setMotd(d.server.motd);
      setPlayers(d.server.players);
      setMaxPlayers(d.server.maxPlayers);
    });
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function patch(body: Record<string, unknown>) {
    const d = await adminFetch("/api/admin/server", { method: "PATCH", body: JSON.stringify(body) });
    setServer(d.server);
    return d.server as Server;
  }

  async function toggleOnline(v: boolean) {
    const s = await patch({ online: v });
    setPlayers(s.players);
    toast(v ? "Сервер запущен" : "Сервер остановлен");
  }

  async function saveSlots() {
    setSaving(true);
    try {
      await patch({ players, maxPlayers });
      toast("Слоты обновлены");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "err");
    } finally {
      setSaving(false);
    }
  }

  async function saveMotd() {
    setSaving(true);
    try {
      await patch({ motd });
      toast("MOTD сохранён — игроки увидят его при входе");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "err");
    } finally {
      setSaving(false);
    }
  }

  async function restart() {
    const s = await patch({ action: "restart" });
    toast(`Сервер «${s.name}» перезапущен`);
  }

  if (!server) return <div className="card p-6 text-ink-400 animate-pulse">Подключение к серверу…</div>;

  const up = uptimeParts(server.startedAt);
  const pct = Math.min(100, Math.round((players / Math.max(1, maxPlayers)) * 100));

  return (
    <div className="space-y-6 rise-in">
      <PanelTitle>СЕРВЕР «ЧЁРНЫЙ» — УПРАВЛЕНИЕ</PanelTitle>

      {/* главная карточка сервера */}
      <div className="card overflow-hidden">
        <div className="relative p-6 border-b border-ink-700 bg-ink-850 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: server.online ? "radial-gradient(500px 160px at 15% 0%, rgba(47,212,107,0.3), transparent)" : "radial-gradient(500px 160px at 15% 0%, rgba(229,72,77,0.25), transparent)" }}
          />
          <div className="relative flex flex-wrap items-center gap-5">
            <span className={`inline-flex w-14 h-14 items-center justify-center rounded-xl border ${server.online ? "border-live-500/50 text-live-500 bg-live-500/10" : "border-off-500/50 text-off-500 bg-off-500/10"}`}>
              <IconServer className="w-7 h-7" />
            </span>
            <div>
              <div className="font-display text-2xl tracking-wide text-ink-100">
                СЕРВЕР 01 — «{server.name.toUpperCase()}»
              </div>
              <div className="font-mono text-[13px] text-ember-300 mt-1">{server.address}</div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-right">
                <div className={`text-[12px] font-bold uppercase tracking-wider ${server.online ? "text-live-500" : "text-off-500"}`}>
                  {server.online ? "В СЕТИ" : "ОСТАНОВЛЕН"}
                </div>
                <div className="text-[11px] text-ink-400 mt-0.5">единственный сервер проекта</div>
              </div>
              <Toggle checked={server.online} onChange={toggleOnline} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink-700">
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-ink-400">Аптайм</div>
            <div className="mt-2 font-display text-xl text-ink-100 tabular-nums">
              {up.d}д {String(up.h).padStart(2, "0")}:{String(up.m).padStart(2, "0")}:{String(up.s).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[12px] text-ink-400">рестартов за всё время: <b className="text-ink-200">{server.restarts}</b></div>
          </div>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-ink-400">Заполненность</div>
            <div className="mt-2 font-display text-xl text-ink-100">{players} / {maxPlayers}</div>
            <div className="mt-2 h-2 rounded-full bg-ink-950 border border-ink-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #f5a623, #ff5c39)" }}
              />
            </div>
          </div>
          <div className="p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-ink-400">Быстрые действия</div>
              <div className="mt-2 text-[12px] text-ink-400">Рестарт сохранит прогресс игроков и обнулит аптайм.</div>
            </div>
            <DangerConfirm
              label="Перезапустить сервер"
              confirmLabel="Подтвердить рестарт"
              onConfirm={restart}
            />
          </div>
        </div>
      </div>

      {/* слоты */}
      <div className="card p-6">
        <h2 className="font-display text-sm tracking-wide text-ink-200 mb-4">СЛОТЫ И ОНЛАЙН</h2>
        <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
          <div>
            <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Игроков сейчас</label>
            <input
              type="number"
              className="field"
              min={0}
              max={maxPlayers}
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Максимум слотов</label>
            <input
              type="number"
              className="field"
              min={10}
              max={2000}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            />
          </div>
        </div>
        <button onClick={saveSlots} disabled={saving} className="btn btn-primary mt-4">
          {saving ? "Сохранение…" : "Сохранить слоты"}
        </button>
      </div>

      {/* MOTD */}
      <div className="card p-6">
        <h2 className="font-display text-sm tracking-wide text-ink-200 mb-1.5">MOTD — ПРИВЕТСТВИЕ СЕРВЕРА</h2>
        <p className="text-[13px] text-ink-400 mb-4">
          Этот текст видят игроки на форуме в виджете сервера и при подключении.
        </p>
        <textarea
          className="field min-h-[90px] resize-y"
          value={motd}
          onChange={(e) => setMotd(e.target.value)}
          maxLength={300}
          placeholder="Например: x2 опыт до конца недели!"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] text-ink-400">{motd.length} / 300</span>
          <button onClick={saveMotd} disabled={saving} className="btn btn-primary">
            {saving ? "Сохранение…" : "Сохранить MOTD"}
          </button>
        </div>
      </div>

      <p className="text-[12px] text-ink-400">
        Изменения сразу отражаются в виджете на главной странице форума.
      </p>
    </div>
  );
}
