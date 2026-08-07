import Link from "next/link";
import Avatar from "@/components/Avatar";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import ServerWidget from "@/components/ServerWidget";
import {
  CATEGORY_ICONS,
  IconArrowRight,
  IconCrown,
  IconFlame,
  IconLock,
  IconPin,
  IconUsers,
} from "@/components/Icons";
import {
  getCategoriesWithStats,
  getForumStats,
  getLatestPosts,
  getOnlineUsers,
  getTopUsers,
  plural,
  timeAgo,
} from "@/lib/forum";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cats, latest, stats, me, top, online] = await Promise.all([
    getCategoriesWithStats(),
    getLatestPosts(10),
    getForumStats(),
    getSessionUser(),
    getTopUsers(5),
    getOnlineUsers(9),
  ]);

  const serverOnline = stats.server?.online ?? false;
  const players = serverOnline ? stats.server?.players ?? 0 : 0;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ══ шапка форума ══ */}
      <section className="relative mt-5 overflow-hidden rounded-xl border border-ink-700 corners">
        <img
          src="/images/masthead.jpg"
          alt="Ночной город — сервер Чёрный"
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-transparent to-ink-950/40" />
        {/* сканлайн */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="scanline absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-ember-500/8 to-transparent" />
        </div>

        <div className="relative px-6 py-10 md:py-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className={`chip ${serverOnline ? "text-live-500 border-live-500/40 bg-live-500/10" : "text-off-500 border-off-500/40 bg-off-500/10"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? "bg-live-500 dot-live" : "bg-off-500"}`} />
                {serverOnline ? "сервер в сети" : "техработы"}
              </span>
              <span className="chip text-gold-300 border-gold-500/40 bg-gold-500/10">сезон 2 · обновление 2.4</span>
            </div>

            <h1 className="mt-5 font-display leading-[0.98] text-ink-100">
              <span className="block text-[13px] md:text-sm tracking-[0.4em] text-ink-300 font-body font-semibold uppercase">
                Официальный форум проекта
              </span>
              <span className="block text-5xl md:text-7xl mt-2 tracking-wide drop-shadow-[0_4px_30px_rgba(255,92,57,0.35)]">
                PHANTOM&nbsp;RP
              </span>
              <span className="block text-2xl md:text-4xl mt-2 tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-ember-400 to-ember-500">
                СЕРВЕР «ЧЁРНЫЙ»
              </span>
            </h1>

            <p className="mt-5 text-ink-300 text-[15px] leading-relaxed max-w-lg">
              Один сервер — одно комьюнити. Новости, правила, жалобы, семьи и рынок.
              Всё, что происходит на Чёрном, обсуждается здесь.
            </p>

            {/* счётчики */}
            <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { v: stats.topics, l: plural(stats.topics, "тема", "темы", "тем") },
                { v: stats.posts, l: plural(stats.posts, "сообщение", "сообщения", "сообщений") },
                { v: stats.users, l: plural(stats.users, "игрок", "игрока", "игроков") },
                { v: players, l: "сейчас в игре" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-[26px] md:text-3xl text-ink-100 leading-none">
                    <CountUp value={s.v} />
                  </div>
                  <div className="text-ink-400 text-[11px] uppercase tracking-[0.18em] font-bold mt-1.5">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn btn-primary notch">
                Начать играть <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/category/2" className="btn btn-ghost">Правила сервера</Link>
              <span className="hidden sm:flex items-center gap-2 font-mono text-[13px] text-ember-300 bg-ink-950/80 border border-ink-700 px-3.5 py-2.5 notch-sm">
                {stats.server?.address ?? "black.phantom-rp.ru:7777"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* бегущая строка */}
      {latest.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-ink-700 bg-ink-900/80 py-2.5 relative">
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 bg-gradient-to-r from-ink-900 via-ink-900 to-transparent">
            <span className="chip text-ember-400 border-ember-500/40 bg-ember-500/10 !py-1">
              <IconFlame className="w-3 h-3" /> live
            </span>
          </div>
          <div className="marquee-track flex w-max items-center gap-9 pl-28">
            {[...latest, ...latest].map((p, i) => (
              <Link
                key={`${p.postId}-${i}`}
                href={`/topic/${p.topicId}`}
                className="flex items-center gap-2 text-[13px] text-ink-300 hover:text-ember-300 transition-colors whitespace-nowrap"
              >
                <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                {p.topicTitle}
                <span className="text-ink-400/70">— {p.authorName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-9 grid lg:grid-cols-[1fr_330px] gap-7 items-start">
        {/* ══ разделы ══ */}
        <div>
          <h2 className="section-title text-lg">РАЗДЕЛЫ ФОРУМА</h2>

          <div className="mt-5 space-y-3">
            {cats.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.icon] ?? CATEGORY_ICONS.folder;
              const hot = cat.postCount >= 10;
              return (
                <Reveal key={cat.id} delay={Math.min(i, 5) * 45}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="card card-hover row-accent group grid md:grid-cols-[1fr_auto_auto] gap-4 items-center p-4 pl-5 block"
                  >
                    <span className="flex items-start gap-4 min-w-0">
                      <span className="relative inline-flex w-12 h-12 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ember-400 transition-transform duration-300 group-hover:scale-105 group-hover:text-gold-300">
                        <Icon className="w-5.5 h-5.5" />
                        {hot && (
                          <span className="absolute -top-1.5 -right-1.5 text-gold-300">
                            <IconFlame className="w-4 h-4 hot-flame" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-display text-[15px] tracking-wide text-ink-100 group-hover:text-ember-300 transition-colors">
                          {cat.name}
                          <IconArrowRight className="w-4 h-4 text-ember-500 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                        </span>
                        <span className="block text-[13px] text-ink-400 mt-1 leading-snug">{cat.description}</span>
                      </span>
                    </span>
                    <span className="hidden md:flex flex-col gap-0.5 text-[12px] text-ink-400 text-right pr-3 border-r border-ink-700 min-w-[96px]">
                      <span><b className="text-ink-200 num">{cat.topicCount}</b> {plural(cat.topicCount, "тема", "темы", "тем")}</span>
                      <span><b className="text-ink-200 num">{cat.postCount}</b> {plural(cat.postCount, "ответ", "ответа", "ответов")}</span>
                    </span>
                    <span className="hidden md:block min-w-[190px] text-[12px]">
                      {cat.latest ? (
                        <>
                          <span className="block truncate text-ink-200 group-hover:text-ember-300 transition-colors font-semibold">
                            {cat.latest.topicTitle}
                          </span>
                          <span className="flex items-center gap-1.5 mt-1 text-ink-400">
                            <Avatar name={cat.latest.authorName} color={cat.latest.authorColor} size={16} />
                            <span className="truncate">{cat.latest.authorName}</span>
                            <span>· {timeAgo(cat.latest.createdAt)}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-ink-400 italic">Пока пусто</span>
                      )}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {!me && (
            <Reveal>
              <div className="mt-6 card p-5 flex flex-wrap items-center gap-4 border-dashed">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[15px] tracking-wide text-ink-100">ЕСТЬ ЧТО СКАЗАТЬ?</div>
                  <p className="text-[13px] text-ink-400 mt-1">
                    Зарегистрируйся, чтобы отвечать в темах, подавать жалобы и торговать на рынке Чёрного.
                  </p>
                </div>
                <Link href="/register" className="btn btn-gold notch-sm">Создать аккаунт</Link>
              </div>
            </Reveal>
          )}
        </div>

        {/* ══ правая колонка ══ */}
        <div className="space-y-5">
          <Reveal>
            <ServerWidget
              initial={
                stats.server
                  ? { ...stats.server, startedAt: stats.server.startedAt.toISOString() }
                  : null
              }
            />
          </Reveal>

          {/* топ недели */}
          <Reveal delay={70}>
            <div className="card corners overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-700 bg-ink-850 flex items-center gap-2 font-display text-[13px] tracking-[0.12em] text-ink-200">
                <IconCrown className="w-4 h-4 text-gold-300" /> ТОП ИГРОКОВ
              </div>
              <ul>
                {top.map((u, i) => (
                  <li key={u.id} className="border-b border-ink-700/60 last:border-0">
                    <Link
                      href={`/user/${u.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-800/70 transition-colors group"
                    >
                      <span
                        className={`num w-6 text-center text-[15px] ${
                          i === 0 ? "text-gold-300" : i === 1 ? "text-ink-200" : i === 2 ? "text-ember-400" : "text-ink-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <Avatar name={u.username} color={u.color} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold truncate group-hover:text-ember-300 transition-colors" style={{ color: u.role === "owner" ? "#ffcf6b" : undefined }}>
                          {u.username}
                        </span>
                        {u.role === "owner" && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gold-300">владелец</span>
                        )}
                      </span>
                      <span className="num text-[13px] text-ink-300">{u.postCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* онлайн сейчас */}
          <Reveal delay={130}>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-[13px] tracking-[0.12em] text-ink-200 flex items-center gap-2">
                  <IconUsers className="w-4 h-4 text-live-500" /> СЕЙЧАС НА ФОРУМЕ
                </span>
                <span className="num text-[13px] text-live-500">{online.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {online.map((u) => (
                  <Link key={u.id} href={`/user/${u.id}`} title={u.username} className="group relative">
                    <Avatar name={u.username} color={u.color} size={34} className="transition-transform duration-200 group-hover:scale-110" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-live-500 border-2 border-ink-950 dot-live" />
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          {/* легенда */}
          <Reveal delay={180}>
            <div className="card p-4">
              <div className="font-display text-[13px] tracking-[0.12em] text-ink-200 mb-3">ОБОЗНАЧЕНИЯ</div>
              <ul className="space-y-2.5 text-[13px] text-ink-300">
                <li className="flex items-center gap-2.5"><IconPin className="w-4 h-4 text-gold-500" /> Закреплённая тема</li>
                <li className="flex items-center gap-2.5"><IconLock className="w-4 h-4 text-ink-400" /> Тема закрыта</li>
                <li className="flex items-center gap-2.5"><IconFlame className="w-4 h-4 text-gold-300" /> Горячий раздел — много активности</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══ последние сообщения ══ */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="section-title text-lg">СВЕЖАЯ АКТИВНОСТЬ</h2>
          <span className="text-[12px] text-ink-400 uppercase tracking-wider font-bold hidden sm:block">
            обновляется в реальном времени
          </span>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {latest.slice(0, 8).map((p, i) => (
            <Reveal key={p.postId} delay={Math.min(i, 5) * 40}>
              <Link
                href={`/topic/${p.topicId}`}
                className="card card-hover row-accent group flex gap-3.5 p-4 pl-5 h-full"
              >
                <Avatar name={p.authorName} color={p.authorColor} size={38} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink-100 truncate group-hover:text-ember-300 transition-colors">
                    {p.topicTitle}
                  </span>
                  <span className="block text-[13px] text-ink-400 truncate mt-1">{p.content}</span>
                  <span className="flex items-center gap-2 mt-2 text-[11px] text-ink-400">
                    <b className="text-ink-300">{p.authorName}</b>
                    <span>·</span>
                    <span>{timeAgo(p.createdAt)}</span>
                    <span>·</span>
                    <span className="text-ember-400/90">«{p.categoryName}»</span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
