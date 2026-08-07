"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "./Toasts";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const isLogin = mode === "login";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) return setError("Ник — минимум 3 символа");
    if (password.length < 6) return setError("Пароль — минимум 6 символов");
    if (!isLogin && password !== password2) return setError("Пароли не совпадают");

    setSending(true);
    const res = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d?.error ?? "Что-то пошло не так");
    }
    toast(isLogin ? "С возвращением на Чёрный!" : "Аккаунт создан — добро пожаловать!");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card overflow-hidden rise-in">
          <div className="relative px-7 pt-7 pb-5 border-b border-ink-700 bg-ink-850">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(400px_120px_at_20%_0%,rgba(255,92,57,0.25),transparent)]" />
            <h1 className="relative font-display text-2xl tracking-wide text-ink-100">
              {isLogin ? "ВХОД НА ФОРУМ" : "РЕГИСТРАЦИЯ"}
            </h1>
            <p className="relative text-[13px] text-ink-400 mt-1.5">
              {isLogin
                ? "Войдите, чтобы отвечать в темах и следить за сервером «Чёрный»."
                : "Создайте аккаунт игрока PHANTOM RP — это быстро."}
            </p>
          </div>

          <form onSubmit={submit} className="p-7 space-y-4">
            <div>
              <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Ник</label>
              <input
                className="field"
                placeholder="Например: Дэн_Блэк"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={32}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Пароль</label>
              <input
                type="password"
                className="field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Повторите пароль</label>
                <input
                  type="password"
                  className="field"
                  placeholder="••••••••"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
            )}
            {error && (
              <div className="px-3.5 py-2.5 rounded-lg text-[13px] bg-off-500/10 border border-off-500/40 text-[#ff9a9e]">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full justify-center" disabled={sending}>
              {sending ? "Секунду…" : isLogin ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <div className="px-7 pb-6 text-[13px] text-ink-400 text-center">
            {isLogin ? (
              <>Нет аккаунта?{" "}
                <Link href="/register" className="text-ember-400 font-semibold hover:text-ember-300">Зарегистрируйтесь</Link>
              </>
            ) : (
              <>Уже с нами?{" "}
                <Link href="/login" className="text-ember-400 font-semibold hover:text-ember-300">Войдите</Link>
              </>
            )}
          </div>
        </div>

        {isLogin && (
          <div className="mt-4 card px-5 py-4 text-[12px] text-ink-400 leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-gold-300">Демо-доступ владельца:</span>{" "}
            ник <code className="text-ember-300">owner</code>, пароль <code className="text-ember-300">blackowner</code>.
            Откроется админ-панель с управлением сервером «Чёрный».
          </div>
        )}
      </div>
    </div>
  );
}
