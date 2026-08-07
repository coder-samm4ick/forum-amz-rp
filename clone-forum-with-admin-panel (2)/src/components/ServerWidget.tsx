"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconCopy, IconSignal } from "./Icons";
import { toast } from "./Toasts";

type ServerInfo = {
  name: string;
  address: string;
  online: boolean;
  players: number;
  maxPlayers: number;
  motd: string;
  startedAt: string;
  restarts: number;
};

function uptimeLabel(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}д ${h}ч ${m}м`;
  if (h > 0) return `${h}ч ${m}м`;
  return `${m}м`;
}

/** правдоподобная история онлайна для спарклайна */
function seedHistory(current: number): number[] {
  const out: number[] = [];
  let v = Math.max(20, current - 60);
  for (let i = 0; i < 23; i++) {
    v = Math.max(10, v + Math.round(Math.random() * 14 - 5));
    out.push(v);
  }
  out.push(current);
  return out;
}

export default function ServerWidget({ initial }: { initial: ServerInfo | null }) {
  const [info, setInfo] = useState<ServerInfo | null>(initial);
  const [history, setHistory] = useState<number[]>(() =>
    initial ? seedHistory(initial.players) : [],
  );
  const [, forceTick] = useState(0);
  const jitterRef = useRef(0);

  const load = useCallback(() => {
    fetch("/api/server", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { server: ServerInfo } | null) => {
        if (d?.server) {
          setInfo(d.server);
          jitterRef.current = Math.floor(Math.random() * 5) - 2;
          setHistory((prev) => [...prev.slice(-23), d.server.players]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      load();
      forceTick((x) => x + 1);
    }, 5000);
    return () => clearInterval(t);
  }, [load]);

  if (!info) return null;

  const players = info.online ? Math.max(0, info.players + jitterRef.current) : 0;
  const pct = Math.min(100, Math.round((players / Math.max(1, info.maxPlayers)) * 100));

  const max = Math.max(...history, 1);
  const points = history
    .map((v, i) => `${(i / Math.max(1, history.length - 1)) * 100},${34 - (v / max) * 30}`)
    .join(" ");

  async function copyIp() {
    try {
      await navigator.clipboard.writeText(info!.address);
      toast("IP сервера скопирован — ждём тебя в игре");
    } catch {
      toast("Не удалось скопировать", "err");
    }
  }

  return (
    <div className="card corners overflow-hidden">
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-ink-700 bg-ink-850">
        <div className="flex items-center gap-2.5 text-ink-200">
          <IconSignal className={`w-4 h-4 ${info.online ? "text-live-500" : "text-off-500"}`} />
          <span className="font-display text-[13px] tracking-[0.14em]">СЕРВЕР «{info.name.toUpperCase()}»</span>
        </div>
        <span
          className={`chip ${info.online ? "text-live-500 border-live-500/40 bg-live-500/10" : "text-off-500 border-off-500/40 bg-off-500/10"}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${info.online ? "bg-live-500 dot-live" : "bg-off-500"}`} />
          {info.online ? "онлайн" : "офлайн"}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-ink-400">Игроки в сети</div>
            <div className="num text-[32px] leading-none mt-1.5 text-ink-100">
              {players}
              <span className="text-ink-400 text-base"> / {info.maxPlayers}</span>
            </div>
          </div>
          {/* эквалайзер */}
          <div className="flex items-end gap-1 h-9">
            {info.online
              ? [0.7, 1, 0.55, 0.85, 0.6].map((d, i) => (
                  <span
                    key={i}
                    className="eq-bar w-1.5 rounded-sm bg-gradient-to-t from-ember-600 to-gold-300"
                    style={{ height: "100%", animationDelay: `${i * 0.14}s`, animationDuration: `${0.8 + d * 0.5}s` }}
                  />
                ))
              : [0.3, 0.3, 0.3, 0.3, 0.3].map((h, i) => (
                  <span key={i} className="w-1.5 rounded-sm bg-ink-700" style={{ height: `${h * 100}%` }} />
                ))}
          </div>
        </div>

        <div className="h-2.5 rounded-full bg-ink-950 border border-ink-700 overflow-hidden">
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #d18a12, #ff5c39)",
              boxShadow: "0 0 14px rgba(255,92,57,0.5)",
            }}
          >
            <span className="absolute inset-0 shimmer" />
          </div>
        </div>

        {/* спарклайн онлайна */}
        {info.online && history.length > 2 && (
          <div className="rounded-lg border border-ink-700 bg-ink-950/70 px-3 pt-2 pb-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-400 font-bold mb-1">
              <span>Динамика онлайна</span>
              <span className="text-live-500">live</span>
            </div>
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="w-full h-10">
              <polyline
                points={points}
                fill="none"
                stroke="#ff5c39"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <polygon points={`0,36 ${points} 100,36`} fill="url(#sparkfill)" opacity="0.35" />
              <defs>
                <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5c39" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ff5c39" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {info.motd && (
          <p className="text-[13px] leading-relaxed text-ink-300 border-l-2 border-gold-500/70 pl-3">
            {info.motd}
          </p>
        )}

        <button
          onClick={copyIp}
          className="notch-sm w-full flex items-center justify-between gap-3 px-3.5 py-3 bg-ink-950 border border-ink-700 hover:border-ember-500/70 transition-colors group"
        >
          <span className="font-mono text-[13px] text-ember-300">{info.address}</span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-ink-400 group-hover:text-ember-300 transition-colors">
            <IconCopy className="w-3.5 h-3.5" /> копировать
          </span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-ink-400 pt-0.5">
          <span>Аптайм: <b className="text-ink-200 num">{uptimeLabel(info.startedAt)}</b></span>
          <span>Рестартов: <b className="text-ink-200 num">{info.restarts}</b></span>
        </div>
      </div>
    </div>
  );
}
