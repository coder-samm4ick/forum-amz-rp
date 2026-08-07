"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; text: string; kind: "ok" | "err" };

let pushToast: ((t: Toast) => void) | null = null;

export function toast(text: string, kind: "ok" | "err" = "ok") {
  pushToast?.({ id: Date.now() + Math.random(), text, kind });
}

export default function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    pushToast = (t) => {
      setItems((prev) => [...prev.slice(-3), t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast-in px-4 py-3 rounded-lg text-sm font-semibold shadow-xl border pointer-events-auto ${
            t.kind === "ok"
              ? "bg-[#12251a] border-[#2fd46b55] text-[#7ce8a8]"
              : "bg-[#2a1214] border-[#e5484d55] text-[#ff9a9e]"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
