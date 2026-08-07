import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";
import { IconChat, IconFolder, IconRules, IconServer, IconShield, IconUsers } from "@/components/Icons";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: IconShield, end: true },
  { href: "/admin/server", label: "Сервер «Чёрный»", icon: IconServer },
  { href: "/admin/users", label: "Пользователи", icon: IconUsers },
  { href: "/admin/topics", label: "Темы", icon: IconChat },
  { href: "/admin/posts", label: "Сообщения", icon: IconRules },
  { href: "/admin/categories", label: "Разделы", icon: IconFolder },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "owner") redirect("/");

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mt-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-500 to-ember-600 text-ink-950">
            <IconShield className="w-5 h-5" />
          </span>
          <div>
            <h1 className="font-display text-xl tracking-wide text-ink-100">ПАНЕЛЬ ВЛАДЕЛЬЦА</h1>
            <p className="text-[12px] text-ink-400">
              Доступ: <span className="text-gold-300 font-semibold">{me.username}</span> · управление проектом PHANTOM RP
            </p>
          </div>
          <Link href="/" className="btn btn-ghost !py-2 !px-4 text-[13px] ml-auto">← На форум</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-6 items-start pb-10">
        <nav className="card p-2 lg:sticky lg:top-20 flex lg:flex-col gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-ink-800 hover:text-ember-300 transition-colors whitespace-nowrap"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
