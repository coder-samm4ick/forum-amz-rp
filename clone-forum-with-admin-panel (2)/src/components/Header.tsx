"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { IconLogout, IconSearch, IconShield } from "./Icons";

type Me = { id: number; username: string; role: string; color: string };
type ServerMini = { online: boolean; players: number };

export default function Header() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [server, setServer] = useState<ServerMini | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .finally(() => setLoaded(true));
    fetch("/api/server")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setServer(d?.server ? { online: d.server.online, players: d.server.players } : null))
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setMenuOpen(false);
    router.refresh();
  }

  function search(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/80 bg-ink-950/88 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-5">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_0_14px_rgba(255,92,57,0.45)]">
            <Logo size={36} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[16px] tracking-[0.08em] text-ink-100 group-hover:text-ember-300 transition-colors">
              PHANTOM&nbsp;RP
            </span>
            <span className="block text-[9px] uppercase tracking-[0.32em] text-ink-400 mt-1">
              сервер «чёрный»
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm text-ink-300 ml-1">
          <Link href="/" className="link-under hover:text-ink-100 transition-colors">Разделы</Link>
          <Link href="/category/2" className="link-under hover:text-ink-100 transition-colors">Правила</Link>
          <Link href="/category/3" className="link-under hover:text-ink-100 transition-colors">Жалобы</Link>
          <Link href="/category/7" className="link-under hover:text-ink-100 transition-colors">Рынок</Link>
        </nav>

        {/* поиск */}
        <form onSubmit={search} className="hidden md:flex items-center ml-auto relative">
          <IconSearch className="w-4 h-4 absolute left-3 text-ink-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по форуму…"
            className="field !pl-9 !py-2 !text-[13px] !w-52 focus:!w-64 transition-all duration-300 !rounded-full !bg-ink-900/80"
          />
        </form>

        <div className={`${loaded && me ? "" : "ml-auto"} md:ml-0 flex items-center gap-3`}>
          {server && (
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border border-ink-700 bg-ink-900/70 hover:border-ember-500/50 transition-colors"
              title="Статус сервера «Чёрный»"
            >
              <span className={`w-2 h-2 rounded-full ${server.online ? "bg-live-500 dot-live" : "bg-off-500"}`} />
              <span className="num text-[13px] text-ink-200">{server.online ? server.players : 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-400">онлайн</span>
            </Link>
          )}

          {loaded && !me && (
            <>
              <Link href="/login" className="btn btn-ghost !py-2 !px-4 text-[13px]">Войти</Link>
              <Link href="/register" className="btn btn-primary notch-sm !py-2 !px-4 text-[13px]">Регистрация</Link>
            </>
          )}
          {loaded && me && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg border border-ink-700 hover:border-ember-500/60 transition-colors"
              >
                <span className="relative">
                  <Avatar name={me.username} color={me.color} size={30} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-live-500 border-2 border-ink-950" />
                </span>
                <span className="text-sm font-semibold max-w-[110px] truncate">{me.username}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 card p-1.5 rise-in shadow-2xl corners">
                  <Link
                    href={`/user/${me.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-ink-200 hover:bg-ink-800 transition-colors"
                  >
                    <Avatar name={me.username} color={me.color} size={22} /> Мой профиль
                  </Link>
                  {me.role === "owner" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-gold-300 hover:bg-ink-800 transition-colors"
                    >
                      <IconShield className="w-4 h-4" /> Админ-панель
                    </Link>
                  )}
                  <div className="h-px bg-ink-700 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-ink-300 hover:bg-ink-800 hover:text-off-500 transition-colors"
                  >
                    <IconLogout className="w-4 h-4" /> Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
