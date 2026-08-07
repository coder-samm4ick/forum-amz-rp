import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Rubik, Russo_One } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import ToastHost from "@/components/Toasts";
import Link from "next/link";

const russo = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-russo",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PHANTOM RP — форум проекта | Сервер «Чёрный»",
  description:
    "Официальный форум RP-проекта PHANTOM: новости, правила, жалобы, организации и торговая площадка сервера «Чёрный».",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${russo.variable} ${rubik.variable}`}>
      <body className="min-h-screen font-body text-ink-100 antialiased">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t border-ink-700/80 bg-ink-900/80 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_140px_at_50%_0%,rgba(255,92,57,0.08),transparent)]" />
            <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 relative">
              <div>
                <div className="flex items-center gap-3">
                  <Logo size={34} />
                  <div>
                    <div className="font-display text-[15px] tracking-[0.08em] text-ink-100">PHANTOM RP</div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-ink-400 mt-0.5">сервер «чёрный»</div>
                  </div>
                </div>
                <p className="mt-4 text-[12px] text-ink-400 leading-relaxed max-w-xs">
                  Виртуальный ролевой проект. Все персонажи и события вымышлены,
                  совпадения случайны. Играйте по правилам.
                </p>
              </div>
              <div>
                <div className="font-display text-[12px] tracking-[0.16em] text-ink-300 mb-3.5">РАЗДЕЛЫ</div>
                <ul className="space-y-2 text-[13px] text-ink-400">
                  <li><Link href="/category/1" className="hover:text-ember-300 transition-colors">Новости проекта</Link></li>
                  <li><Link href="/category/2" className="hover:text-ember-300 transition-colors">Правила и гайды</Link></li>
                  <li><Link href="/category/3" className="hover:text-ember-300 transition-colors">Жалобы на игроков</Link></li>
                  <li><Link href="/category/7" className="hover:text-ember-300 transition-colors">Торговая площадка</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-display text-[12px] tracking-[0.16em] text-ink-300 mb-3.5">ПОДКЛЮЧЕНИЕ</div>
                <div className="font-mono text-[13px] text-ember-300 bg-ink-950 border border-ink-700 px-3.5 py-2.5 notch-sm inline-block">
                  black.phantom-rp.ru:7777
                </div>
                <p className="mt-3 text-[12px] text-ink-400 leading-relaxed">
                  Единственный сервер проекта. Лаунчер скачивается с главной,
                  аккаунт форума подходит для входа в игру.
                </p>
              </div>
            </div>
            <div className="border-t border-ink-700/70 relative">
              <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between text-[11px] text-ink-400">
                <span>© {new Date().getFullYear()} PHANTOM RP</span>
                <span className="num">сделано игроками — для игроков</span>
              </div>
            </div>
          </footer>
        </div>
        <ToastHost />
      </body>
    </html>
  );
}
