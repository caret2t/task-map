"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, CalendarDays, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

export function MobileNav() {
  const pathname = usePathname();
  const { setInlineAddOpen, toggleSidebar } = useUIStore();

  const isTaskActive =
    ["/inbox", "/today", "/upcoming", "/search"].includes(pathname) ||
    pathname.startsWith("/project/") ||
    pathname.startsWith("/area/");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Glass backdrop */}
      <div
        className="absolute inset-0 border-t border-[var(--border)]/60"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
        }}
      />
      <div
        className="relative flex items-end justify-around px-4"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))", paddingTop: "0.375rem" }}
      >
        {/* タスク */}
        <NavTab
          href="/today"
          icon={List}
          label="タスク"
          active={isTaskActive && pathname !== "/upcoming"}
        />

        {/* カレンダー */}
        <NavTab
          href="/upcoming"
          icon={CalendarDays}
          label="近日"
          active={pathname === "/upcoming"}
        />

        {/* 追加ボタン（中央） */}
        <button
          onClick={() => setInlineAddOpen(true)}
          className="relative flex flex-col items-center gap-0.5 -mt-4"
          aria-label="タスクを追加"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/30 transition-transform active:scale-95">
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-[10px] text-[var(--muted)] mt-0.5">追加</span>
        </button>

        {/* 今日 */}
        <NavTab
          href="/inbox"
          icon={() => (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          label="インボックス"
          active={pathname === "/inbox"}
        />

        {/* メニュー */}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center gap-0.5 py-1 min-w-[3rem] transition-transform active:scale-95"
        >
          <span className="flex items-center justify-center w-10 h-6 rounded-full">
            <Menu className="w-5 h-5 text-[var(--muted)]" />
          </span>
          <span className="text-[10px] font-medium text-[var(--muted)]">メニュー</span>
        </button>
      </div>
    </nav>
  );
}

function NavTab({
  href, icon: Icon, label, active,
}: {
  href: string; icon: React.ElementType; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 py-1 min-w-[3rem] transition-transform active:scale-95"
    >
      <span className={cn(
        "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
        active && "bg-[var(--primary)]/15"
      )}>
        <Icon className={cn("w-5 h-5 transition-colors", active ? "text-[var(--primary)]" : "text-[var(--muted)]")} />
      </span>
      <span className={cn(
        "text-[10px] font-medium transition-colors",
        active ? "text-[var(--primary)]" : "text-[var(--muted)]"
      )}>
        {label}
      </span>
    </Link>
  );
}
