import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import Reveal from "@/components/Reveal";
import { IconEye, IconLock, IconPin } from "@/components/Icons";
import { getSessionUser } from "@/lib/auth";
import { getPostCountsByAuthor, getPostsPage, plural, timeAgo, topicExists, POSTS_PER_PAGE } from "@/lib/forum";
import { ReplyForm, ViewPing } from "./client";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const topicId = Number(id);
  const page = Math.max(1, Number(pageParam) || 1);
  if (!Number.isFinite(topicId)) notFound();

  const [topicRow, me] = await Promise.all([topicExists(topicId), getSessionUser()]);
  if (!topicRow) notFound();
  const { topic, categoryName, categoryId } = topicRow;

  const { list, total } = await getPostsPage(topicId, page);
  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const authorIds = [...new Set(list.map((r) => r.author.id))];
  const postCounts = await getPostCountsByAuthor(authorIds);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <ViewPing topicId={topicId} />

      <div className="mt-6 text-[13px] text-ink-400">
        <Link href="/" className="hover:text-ember-300 transition-colors">Форум</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${categoryId}`} className="hover:text-ember-300 transition-colors">{categoryName}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-200">тема</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl md:text-3xl tracking-wide text-ink-100 leading-snug">
          {topic.title}
        </h1>
        <span className="flex items-center gap-4 text-[13px] text-ink-400 ml-auto">
          {topic.pinned && (
            <span className="inline-flex items-center gap-1.5 text-gold-500 font-semibold">
              <IconPin className="w-4 h-4" /> закреплена
            </span>
          )}
          {topic.closed && (
            <span className="inline-flex items-center gap-1.5">
              <IconLock className="w-4 h-4" /> закрыта
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <IconEye className="w-4 h-4" /> {topic.views} {plural(topic.views, "просмотр", "просмотра", "просмотров")}
          </span>
        </span>
      </div>

      {/* посты */}
      <div className="mt-6 space-y-4">
        {list.map(({ post, author }, i) => {
          const isOP = i === 0 && page === 1;
          const count = postCounts.get(author.id) ?? 0;
          return (
            <Reveal key={post.id} delay={Math.min(i, 5) * 40}>
              <article className="card overflow-hidden">
                <div className="grid md:grid-cols-[220px_1fr]">
                  {/* автор */}
                  <aside className="border-b md:border-b-0 md:border-r border-ink-700 bg-ink-850/80 p-4 flex md:flex-col items-center md:items-center gap-4 md:gap-3 md:text-center">
                    <Link href={`/user/${author.id}`} className="transition-transform duration-200 hover:scale-105">
                      <Avatar name={author.username} color={author.color} size={64} />
                    </Link>
                    <div className="md:w-full">
                      <Link
                        href={`/user/${author.id}`}
                        className="font-display text-[15px] tracking-wide truncate block hover:opacity-80 transition-opacity"
                        style={{ color: author.color }}
                      >
                        {author.username}
                      </Link>
                      <div className="mt-1">
                        {author.role === "owner" ? (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-300 border border-gold-500/40">
                            Владелец
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-700/70 text-ink-300 border border-ink-600">
                            Игрок
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-ink-400 leading-relaxed hidden md:block">
                        <div>{count} {plural(count, "сообщение", "сообщения", "сообщений")}</div>
                        <div>на форуме с {author.createdAt.toLocaleDateString("ru-RU", { month: "short", year: "numeric" })}</div>
                        {author.bio && <div className="mt-1.5 italic text-ink-300/80">«{author.bio}»</div>}
                      </div>
                    </div>
                  </aside>

                  {/* содержимое */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[12px] text-ink-400 pb-3 border-b border-ink-700/70">
                      <span>
                        {isOP && (
                          <span className="mr-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ember-500/15 text-ember-400 border border-ember-500/40">
                            автор темы
                          </span>
                        )}
                        {timeAgo(post.createdAt)}
                      </span>
                      <span className="font-mono text-ink-400/70">#{post.id}</span>
                    </div>
                    <div className="pt-4 text-[14.5px] leading-relaxed text-ink-200 whitespace-pre-wrap break-words">
                      {post.content}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* пагинация */}
      {pages > 1 && (
        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/topic/${topicId}?page=${p}`}
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

      <div className="mt-8">
        <ReplyForm topicId={topicId} closed={topic.closed} meId={me?.id ?? null} />
      </div>
    </div>
  );
}
