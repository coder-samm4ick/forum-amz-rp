import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, gameServer, posts, topics, users } from "@/db/schema";

export function timeAgo(input: Date | string): string {
  const date = input instanceof Date ? input : new Date(input);
  const diff = Math.max(0, Date.now() - date.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d === 1) return "вчера";
  if (d < 7) return `${d} дн назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export type CategoryRow = typeof categories.$inferSelect & {
  topicCount: number;
  postCount: number;
  latest: {
    topicId: number;
    topicTitle: string;
    authorName: string;
    authorColor: string;
    createdAt: Date;
  } | null;
};

export async function getCategoriesWithStats(): Promise<CategoryRow[]> {
  const cats = await db.select().from(categories).orderBy(categories.sortOrder, categories.id);
  const rows: CategoryRow[] = [];
  for (const cat of cats) {
    const [t] = await db
      .select({ value: count() })
      .from(topics)
      .where(eq(topics.categoryId, cat.id));
    const [p] = await db
      .select({ value: count() })
      .from(posts)
      .innerJoin(topics, eq(posts.topicId, topics.id))
      .where(eq(topics.categoryId, cat.id));
    const latestRows = await db
      .select({
        topicId: topics.id,
        topicTitle: topics.title,
        authorName: users.username,
        authorColor: users.color,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(topics, eq(posts.topicId, topics.id))
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(topics.categoryId, cat.id))
      .orderBy(desc(posts.createdAt))
      .limit(1);
    rows.push({
      ...cat,
      topicCount: t?.value ?? 0,
      postCount: p?.value ?? 0,
      latest: latestRows[0] ?? null,
    });
  }
  return rows;
}

export const TOPICS_PER_PAGE = 12;
export const POSTS_PER_PAGE = 15;

export async function getTopicsPage(categoryId: number, page: number) {
  const offset = (page - 1) * TOPICS_PER_PAGE;
  const list = await db
    .select({
      topic: topics,
      authorName: users.username,
      authorColor: users.color,
      replyCount: count(posts.id),
      lastActivity: sql<Date>`MAX(${posts.createdAt})`,
    })
    .from(topics)
    .innerJoin(users, eq(topics.authorId, users.id))
    .leftJoin(posts, eq(posts.topicId, topics.id))
    .where(eq(topics.categoryId, categoryId))
    .groupBy(topics.id, users.username, users.color)
    .orderBy(desc(topics.pinned), desc(sql`GREATEST(${topics.createdAt}, COALESCE(MAX(${posts.createdAt}), ${topics.createdAt}))`))
    .limit(TOPICS_PER_PAGE)
    .offset(offset);
  const [total] = await db
    .select({ value: count() })
    .from(topics)
    .where(eq(topics.categoryId, categoryId));
  return { list, total: total?.value ?? 0 };
}

export async function getLatestPosts(limit = 7) {
  return db
    .select({
      postId: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      topicId: topics.id,
      topicTitle: topics.title,
      categoryId: topics.categoryId,
      categoryName: categories.name,
      authorId: users.id,
      authorName: users.username,
      authorColor: users.color,
    })
    .from(posts)
    .innerJoin(topics, eq(posts.topicId, topics.id))
    .innerJoin(categories, eq(topics.categoryId, categories.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function getForumStats() {
  const [u] = await db.select({ value: count() }).from(users);
  const [t] = await db.select({ value: count() }).from(topics);
  const [p] = await db.select({ value: count() }).from(posts);
  const server = (await db.select().from(gameServer).limit(1))[0] ?? null;
  return {
    users: u?.value ?? 0,
    topics: t?.value ?? 0,
    posts: p?.value ?? 0,
    server,
  };
}

export async function getPostCountsByAuthor(authorIds: number[]) {
  if (authorIds.length === 0) return new Map<number, number>();
  const rows = await db
    .select({ authorId: posts.authorId, value: count() })
    .from(posts)
    .where(sql`${posts.authorId} IN ${authorIds}`)
    .groupBy(posts.authorId);
  return new Map(rows.map((r) => [r.authorId, r.value]));
}

export async function getUserById(id: number) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function topicExists(id: number) {
  const rows = await db
    .select({ topic: topics, categoryName: categories.name, categoryId: categories.id })
    .from(topics)
    .innerJoin(categories, eq(topics.categoryId, categories.id))
    .where(eq(topics.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPostsPage(topicId: number, page: number) {
  const offset = (page - 1) * POSTS_PER_PAGE;
  const list = await db
    .select({ post: posts, author: users })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.topicId, topicId))
    .orderBy(posts.createdAt, posts.id)
    .limit(POSTS_PER_PAGE)
    .offset(offset);
  const [total] = await db.select({ value: count() }).from(posts).where(eq(posts.topicId, topicId));
  return { list, total: total?.value ?? 0 };
}

export async function isTopicParticipant(topicId: number, userId: number) {
  const [row] = await db
    .select({ value: count() })
    .from(posts)
    .where(and(eq(posts.topicId, topicId), eq(posts.authorId, userId)));
  return (row?.value ?? 0) > 0;
}

export async function searchForum(q: string) {
  const like = `%${q}%`;
  const topicHits = await db
    .select({
      id: topics.id,
      title: topics.title,
      views: topics.views,
      pinned: topics.pinned,
      createdAt: topics.createdAt,
      categoryId: categories.id,
      categoryName: categories.name,
      authorName: users.username,
      authorColor: users.color,
    })
    .from(topics)
    .innerJoin(categories, eq(topics.categoryId, categories.id))
    .innerJoin(users, eq(topics.authorId, users.id))
    .where(sql`${topics.title} ILIKE ${like}`)
    .orderBy(desc(topics.createdAt))
    .limit(15);

  const postHits = await db
    .select({
      postId: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      topicId: topics.id,
      topicTitle: topics.title,
      authorName: users.username,
      authorColor: users.color,
    })
    .from(posts)
    .innerJoin(topics, eq(posts.topicId, topics.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(sql`${posts.content} ILIKE ${like}`)
    .orderBy(desc(posts.createdAt))
    .limit(15);

  return { topicHits, postHits };
}

export async function getTopUsers(limit = 5) {
  return db
    .select({
      id: users.id,
      username: users.username,
      color: users.color,
      role: users.role,
      postCount: count(posts.id),
    })
    .from(users)
    .innerJoin(posts, eq(posts.authorId, users.id))
    .where(eq(users.banned, false))
    .groupBy(users.id, users.username, users.color, users.role)
    .orderBy(desc(count(posts.id)))
    .limit(limit);
}

export async function getOnlineUsers(limit = 9) {
  return db
    .select({ id: users.id, username: users.username, color: users.color, role: users.role })
    .from(users)
    .where(eq(users.banned, false))
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export async function getUserProfile(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  const [topicCount] = await db
    .select({ value: count() })
    .from(topics)
    .where(eq(topics.authorId, userId));
  const [postCount] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.authorId, userId));
  const recent = await db
    .select({
      postId: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      topicId: topics.id,
      topicTitle: topics.title,
      categoryName: categories.name,
    })
    .from(posts)
    .innerJoin(topics, eq(posts.topicId, topics.id))
    .innerJoin(categories, eq(topics.categoryId, categories.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(8);
  return { user, topicCount: topicCount?.value ?? 0, postCount: postCount?.value ?? 0, recent };
}
