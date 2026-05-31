"use client";

import { List, LayoutGrid, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectViewMode } from "@/store/uiStore";
import { useUIStore } from "@/store/uiStore";

const VIEWS: { mode: ProjectViewMode; icon: React.ElementType; label: string }[] = [
  { mode: "list",     icon: List,         label: "リスト" },
  { mode: "board",    icon: LayoutGrid,   label: "ボード" },
  { mode: "calendar", icon: CalendarDays, label: "カレンダー" },
];

export function ViewSwitcher() {
  const { projectViewMode, setProjectViewMode } = useUIStore();

  return (
    <div className="flex items-center gap-0.5 bg-[var(--surface-2)] rounded-lg p-0.5">
      {VIEWS.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setProjectViewMode(mode)}
          title={label}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors",
            projectViewMode === mode
              ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
