"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { toast } from "@/components/Toasts";
import { adminFetch, DangerConfirm, PanelTitle } from "../kit";

type PostRow = {
  id: number;
  content: string;
  createdAt: string;
  topicId: number;
  topicTitle: string;
  authorName: string;
  authorColor: string;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/admin/posts")
      .then((d: { posts: PostRow[] }) => setPosts(d.posts))
      .finally(() => setLoading(false));
  }, []);

  async function deletePost(postId: number) {
    await adminFetch("/api/admin/posts", { method: "DELETE", body: JSON.stringify({ postId }) });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast("Сообщение удалено");
  }

  return (
    <div className="space-y-5 rise-in">
      <PanelTitle>СООБЩЕНИЯ — ПОСЛЕДНИЕ 40</PanelTitle>

      {loading ? (
        <div className="card p-6 text-ink-400 animate-pulse">Загрузка…</div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Avatar name={p.authorName} color={p.authorColor} size={30} />
                <span className="text-sm font-semibold" style={{ color: p.authorColor }}>{p.authorName}</span>
                <span className="text-[12px] text-ink-400">
                  в теме{" "}
                  <Link href={`/topic/${p.topicId}`} className="text-ember-400 hover:text-ember-300 font-semibold">
                    {p.topicTitle}
                  </Link>
                </span>
                <span className="text-[12px] text-ink-400 ml-auto">
                  {new Date(p.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <DangerConfirm small onConfirm={() => deletePost(p.id)} />
              </div>
              <p className="mt-3 text-[14px] text-ink-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                {p.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
