import Link from "next/link";
import Avatar from "@/components/Avatar";
import { IconChat, IconDoc, IconSearch } from "@/components/Icons";
import { searchForum, timeAgo, plural } from "@/lib/forum";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length >= 2 ? await searchForum(query) : null;
  const totalHits = results ? results.topicHits.length + results.postHits.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mt-8">
        <h1 className="section-title text-2xl">ПОИСК ПО ФОРУМУ</h1>

        <form action="/search" method="GET" className="mt-5 flex gap-3">
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Тема, слово или фраза…"
              className="field !pl-10 !py-3"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary">Найти</button>
        </form>
      </div>

      {query.length > 0 && query.length < 2 && (
        <p className="mt-6 text-sm text-ink-400">Введите минимум 2 символа.</p>
      )}

      {results && (
        <p className="mt-6 text-sm text-ink-300">
          По запросу <b className="text-ember-300">«{query}»</b> найдено{" "}
          <b className="num text-ink-100">{totalHits}</b> {plural(totalHits, "совпадение", "совпадения", "совпадений")}
        </p>
      )}

      {results && results.topicHits.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-sm tracking-[0.14em] text-ink-300 flex items-center gap-2 mb-3">
            <IconDoc className="w-4 h-4 text-gold-300" /> ТЕМЫ
          </h2>
          <div className="space-y-2.5">
            {results.topicHits.map((t) => (
              <Link key={t.id} href={`/topic/${t.id}`} className="card card-hover row-accent group flex items-center gap-4 p-4 pl-5">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[15px] text-ink-100 group-hover:text-ember-300 transition-colors truncate">
                    {t.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-ink-400">
                    <span className="text-ember-400/90">«{t.categoryName}»</span>
                    <span>· {t.authorName}</span>
                    <span>· {timeAgo(t.createdAt)}</span>
                    <span>· {t.views} просмотров</span>
                  </div>
                </div>
                <Avatar name={t.authorName} color={t.authorColor} size={32} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {results && results.postHits.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-sm tracking-[0.14em] text-ink-300 flex items-center gap-2 mb-3">
            <IconChat className="w-4 h-4 text-gold-300" /> СООБЩЕНИЯ
          </h2>
          <div className="space-y-2.5">
            {results.postHits.map((p) => (
              <Link key={p.postId} href={`/topic/${p.topicId}`} className="card card-hover row-accent group block p-4 pl-5">
                <p className="text-[14px] text-ink-200 leading-relaxed line-clamp-2">{p.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-ink-400">
                  <Avatar name={p.authorName} color={p.authorColor} size={18} />
                  <b className="text-ink-300">{p.authorName}</b>
                  <span>в теме</span>
                  <span className="text-ember-400/90 truncate max-w-[240px]">{p.topicTitle}</span>
                  <span>· {timeAgo(p.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results && totalHits === 0 && (
        <div className="mt-10 card p-10 text-center">
          <div className="font-display text-xl text-ink-200">Ничего не нашлось</div>
          <p className="mt-2 text-sm text-ink-400">
            Попробуйте другой запрос — например, «жалоба», «рынок» или «обновление».
          </p>
        </div>
      )}
    </div>
  );
}
