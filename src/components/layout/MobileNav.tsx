"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, CalendarDays, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

const NAV_ITEMS = [
  { href: "/today", icon: List, label: "タスク" },
  { href: "/upcoming", icon: CalendarDays, label: "カレンダー" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setInlineAddOpen, toggleSidebar } = useUIStore();

  const isTaskActive = ["/inbox", "/today", "/upcoming", "/search"].includes(pathname)
    || pathname.startsWith("/project/")
    || pathname.startsWith("/area/");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl border-t border-[var(--border)]" style={{ backgroundColor: 'color-mix(in srgb, var(--background) 85%, transparent)' }} />

      <div className="relative flex items-end justify-around px-6 pb-safe pt-1" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
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
          label="カレンダー"
          active={pathname === "/upcoming"}
        />

        {/* 追加ボタン（中央・浮き上がり） */}
        <button
          onClick={() => setInlineAddOpen(true)}
          className="relative flex flex-col items-center -mt-5"
          aria-label="タスクを追加"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)] shadow-lg transition-transform active:scale-95">
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-[10px] text-[var(--muted)] mt-1">追加</span>
        </button>

        {/* スペーサー */}
        <div className="flex flex-col items-center w-12" />

        {/* メニュー */}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center gap-1 py-1 min-w-[3rem]"
        >
          <span className="flex items-center justify-center w-6 h-6 text-[var(--muted)]">
            <Menu className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-[var(--muted)]">メニュー</span>
        </button>
      </div>
    </nav>
  );
}

function NavTab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 py-1 min-w-[3rem] transition-transform active:scale-95"
    >
      <span className={cn(
        "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
        active ? "bg-blue-500/15" : ""
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
