"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "@/components/Toasts";

export function StatCard({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      <div
        className="absolute -right-6 -top-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent ?? "#ff5c39" }}
      />
      <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-ink-400">{label}</div>
      <div className="mt-2 font-display text-3xl text-ink-100">{value}</div>
      {hint && <div className="mt-1.5 text-[12px] text-ink-400">{hint}</div>}
    </div>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-xl md:text-2xl tracking-wide text-ink-100 flex items-center gap-3">
      <span className="w-1 h-6 bg-gradient-to-b from-gold-500 to-ember-500 rounded-full" />
      {children}
    </h1>
  );
}

export async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.error ?? `Ошибка ${res.status}`);
  }
  return res.json();
}

/** Кнопка удаления с двухшаговым подтверждением */
export function DangerConfirm({
  label = "Удалить",
  confirmLabel = "Точно?",
  onConfirm,
  small,
}: {
  label?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  small?: boolean;
}) {
  const [arming, setArming] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleClick() {
    if (!arming) {
      setArming(true);
      timer.current = setTimeout(() => setArming(false), 2500);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    try {
      await onConfirm();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не получилось", "err");
    } finally {
      setBusy(false);
      setArming(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`btn btn-danger ${small ? "!px-3 !py-1.5 !text-[12px]" : ""}`}
    >
      {busy ? "…" : arming ? confirmLabel : label}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-8 rounded-full border transition-colors duration-200 ${
        checked ? "bg-live-500/25 border-live-500/60" : "bg-ink-800 border-ink-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-200 shadow ${
          checked ? "left-7 bg-live-500" : "left-1 bg-ink-400"
        }`}
      />
    </button>
  );
}
