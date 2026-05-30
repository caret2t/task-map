"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, CalendarDays, Calendar, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

const navItems = [
  { href: "/inbox", icon: Inbox, label: "インボックス" },
  { href: "/today", icon: CalendarDays, label: "今日" },
  { href: "/upcoming", icon: Calendar, label: "近日" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setCommandPaletteOpen, setQuickCaptureOpen } = useUIStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors",
              pathname === href ? "text-blue-500" : "text-[var(--muted)]"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-[var(--muted)]"
        >
          <Search className="w-5 h-5" />
          検索
        </button>
        <button
          onClick={() => setQuickCaptureOpen(true)}
          className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
