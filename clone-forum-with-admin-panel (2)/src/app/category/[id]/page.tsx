import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import Reveal from "@/components/Reveal";
import { CATEGORY_ICONS, IconEye, IconFlame, IconLock, IconPin, IconPlus, IconReply } from "@/components/Icons";
import { getSessionUser } from "@/lib/auth";
import { getTopicsPage, plural, timeAgo, TOPICS_PER_PAGE } from "@/lib/forum";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const categoryId = Number(id);
  const page = Math.max(1, Number(pageParam) || 1);
  if (!Number.isFinite(categoryId)) notFound();

  const cat = (await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1))[0];
  if (!cat) notFound();

  const [{ list, total }, me] = await Promise.all([getTopicsPage(categoryId, page), getSessionUser()]);
  const pages = Math.max(1, Math.ceil(total / TOPICS_PER_PAGE));
  const Icon = CATEGORY_ICONS[cat.icon] ?? CATEGORY_ICONS.folder;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* хлебные крошки + шапка раздела */}
      <div className="mt-6 text-[13px] text-ink-400">
        <Link href="/" className="hover:text-ember-300 transition-colors">Форум</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-200">{cat.name}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="inline-flex w-14 h-14 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-ember-400">
          <Icon className="w-7 h-7" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl tracking-wide text-ink-100">{cat.name}</h1>
          <p className="text-[14px] text-ink-400 mt-1">{cat.description}</p>
        </div>
        {me && (
          <Link href={`/new-topic?cat=${cat.id}`} className="btn btn-primary ml-auto">
            <IconPlus className="w-4 h-4" /> Новая тема
          </Link>
        )}
      </div>

      {/* список тем */}
      <div className="mt-6 card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_90px_90px_180px] gap-4 px-5 py-2.5 border-b border-ink-700 bg-ink-850 text-[11px] uppercase tracking-wider text-ink-400 font-bold">
          <span>Тема</span>
          <span className="text-center">Ответы</span>
          <span className="text-center">Просмотры</span>
          <span>Последний ответ</span>
        </div>

        {list.length === 0 && (
          <div className="px-6 py-14 text-center text-ink-400">
            В этом разделе пока нет тем.{" "}
            {me ? (
              <Link href={`/new-topic?cat=${cat.id}`} className="text-ember-400 hover:text-ember-300 font-semibold">
                Создайте первую!
              </Link>
            ) : (
              "Станьте первым — зарегистрируйтесь."
            )}
          </div>
        )}

        <ul className="divide-y divide-ink-700/70">
          {list.map((row, i) => {
            const replies = row.replyCount > 0 ? row.replyCount - 1 : 0;
            return (
              <Reveal key={row.topic.id} delay={Math.min(i, 6) * 35}>
                <li className="grid md:grid-cols-[1fr_90px_90px_180px] gap-3 md:gap-4 px-5 py-4 hover:bg-ink-800/60 transition-colors group">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar name={row.authorName} color={row.authorColor} size={36} />
                    <div className="min-w-0">
                      <Link
                        href={`/topic/${row.topic.id}`}
                        className={`flex items-center gap-2 leading-snug font-semibold text-[15px] group-hover:text-ember-300 transition-colors ${
                          row.topic.pinned ? "text-gold-300" : "text-ink-100"
                        }`}
                      >
                        {row.topic.title}
                        {replies >= 5 && <IconFlame className="w-4 h-4 text-gold-300 hot-flame shrink-0" />}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-400">
                        {row.topic.pinned && (
                          <span className="inline-flex items-center gap-1 text-gold-500 font-semibold">
                            <IconPin className="w-3.5 h-3.5" /> закреплена
                          </span>
                        )}
                        {row.topic.closed && (
                          <span className="inline-flex items-center gap-1 text-ink-400">
                            <IconLock className="w-3.5 h-3.5" /> закрыта
                          </span>
                        )}
                        <Link
                          href={`/user/${row.topic.authorId}`}
                          className="hover:text-ember-300 transition-colors font-semibold"
                          style={{ color: row.authorColor }}
                        >
                          {row.authorName}
                        </Link>
                        <span>· {timeAgo(row.topic.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-start justify-center pt-2 text-sm text-ink-300">
                    <span className="inline-flex items-center gap-1.5">
                      <IconReply className="w-3.5 h-3.5 text-ink-400" /> {replies}
                    </span>
                  </div>
                  <div className="hidden md:flex items-start justify-center pt-2 text-sm text-ink-300">
                    <span className="inline-flex items-center gap-1.5">
                      <IconEye className="w-3.5 h-3.5 text-ink-400" /> {row.topic.views}
                    </span>
                  </div>
                  <div className="hidden md:block text-[12px] text-ink-400 pt-1">
                    {row.lastActivity ? (
                      <>
                        <span className="text-ink-200 font-semibold">{timeAgo(row.lastActivity)}</span>
                        <span className="block mt-0.5">
                          всего {replies} {plural(replies, "ответ", "ответа", "ответов")}
                        </span>
                      </>
                    ) : (
                      <span className="italic">нет ответов</span>
                    )}
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {/* пагинация */}
      {pages > 1 && (
        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${categoryId}?page=${p}`}
              className={`w-9 h-9 inline-flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
                p === page
                  ? "bg-ember-500 text-ink-950 border-ember-500"
                  : "border-ink-700 text-ink-300 hover:border-ember-500/60 hover:text-ember-300"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      {!me && (
        <p className="mt-5 text-[13px] text-ink-400">
          Чтобы создать тему,{" "}
          <Link href="/login" className="text-ember-400 hover:text-ember-300 font-semibold">войдите</Link>{" "}
          или{" "}
          <Link href="/register" className="text-ember-400 hover:text-ember-300 font-semibold">зарегистрируйтесь</Link>.
        </p>
      )}
    </div>
  );
}
