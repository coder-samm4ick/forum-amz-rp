import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import Reveal from "@/components/Reveal";
import { IconClock, IconDoc, IconShield } from "@/components/Icons";
import { getUserProfile, plural, timeAgo } from "@/lib/forum";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) notFound();

  const profile = await getUserProfile(userId);
  if (!profile) notFound();
  const { user, topicCount, postCount, recent } = profile;

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* шапка профиля */}
      <div className="mt-8 card corners overflow-hidden">
        <div
          className="h-24 relative"
          style={{
            background: `linear-gradient(110deg, ${user.color}2e, transparent 55%), radial-gradient(300px 90px at 80% 20%, ${user.color}33, transparent)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage: "linear-gradient(180deg, black, transparent)",
            }}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end gap-5 -mt-10">
            <div className="float-y drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
              <Avatar name={user.username} color={user.color} size={88} className="!rounded-xl !text-3xl border-4 border-ink-950" />
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: user.color }}>
                  {user.username}
                </h1>
                {user.role === "owner" ? (
                  <span className="chip text-gold-300 border-gold-500/40 bg-gold-500/10">
                    <IconShield className="w-3 h-3" /> владелец проекта
                  </span>
                ) : (
                  <span className="chip text-ink-300 border-ink-600 bg-ink-800">игрок</span>
                )}
                {user.banned && (
                  <span className="chip text-off-500 border-off-500/40 bg-off-500/10">заблокирован</span>
                )}
              </div>
              {user.bio && <p className="mt-1.5 text-[14px] text-ink-300 italic">«{user.bio}»</p>}
              <p className="mt-1.5 text-[12px] text-ink-400 flex items-center gap-1.5">
                <IconClock className="w-3.5 h-3.5" />
                на форуме с {user.createdAt.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="ml-auto flex gap-8 pb-1">
              <div className="text-center">
                <div className="text-2xl text-ink-100 num">{topicCount}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-ink-400 mt-1">
                  {plural(topicCount, "тема", "темы", "тем")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-ink-100 num">{postCount}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-ink-400 mt-1">
                  {plural(postCount, "сообщение", "сообщения", "сообщений")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* последние сообщения */}
      <h2 className="section-title text-lg mt-10">ПОСЛЕДНИЕ СООБЩЕНИЯ</h2>
      {recent.length === 0 ? (
        <div className="mt-5 card p-8 text-center text-ink-400 text-sm">
          Игрок пока ничего не написал.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {recent.map((p, i) => (
            <Reveal key={p.postId} delay={Math.min(i, 5) * 40}>
              <Link href={`/topic/${p.topicId}`} className="card card-hover row-accent group block p-4 pl-5">
                <p className="text-[14px] text-ink-200 leading-relaxed whitespace-pre-wrap line-clamp-3">{p.content}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-ink-400">
                  <IconDoc className="w-3.5 h-3.5 text-gold-500" />
                  <span className="text-ink-200 font-semibold group-hover:text-ember-300 transition-colors truncate max-w-[300px]">
                    {p.topicTitle}
                  </span>
                  <span>· «{p.categoryName}»</span>
                  <span>· {timeAgo(p.createdAt)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
