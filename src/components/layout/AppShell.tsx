"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeProvider } from "./ThemeProvider";
import { CommandPalette } from "@/components/search/CommandPalette";
import { TaskDetailPane } from "@/components/task/TaskDetailPane";
import { FocusMode } from "@/components/focus/FocusMode";
import { NotificationSetup } from "./NotificationSetup";
import { useTaskStore } from "@/store/taskStore";
import { useUIStore, type ThemeMode } from "@/store/uiStore";
import { Sun, Moon, Monitor, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { value: ThemeMode; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "ライト" },
  { value: "system", icon: Monitor, label: "自動" },
  { value: "dark", icon: Moon, label: "ダーク" },
];

function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  return (
    <div className="flex items-center gap-0.5 bg-[var(--surface-2)] rounded-lg p-0.5">
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            theme === value
              ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { selectedTaskId } = useTaskStore();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSidebarOpen(e.matches);
    };
    onChange(mq);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setSidebarOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        {/* Desktop Sidebar */}
        <div className={cn("hidden lg:block transition-all duration-200 flex-shrink-0", sidebarOpen ? "w-64" : "w-0 overflow-hidden")}>
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-64 relative z-50">
              <Sidebar />
            </div>
            <div className="flex-1 bg-black/30" onClick={toggleSidebar} />
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden flex-col">
          {/* Mobile header */}
          <div className="lg:hidden flex-shrink-0 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-4 h-12 z-30">
            <button onClick={toggleSidebar} className="p-1 text-[var(--muted)]">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-semibold text-sm">TaskMap</span>
            <ThemeToggle />
          </div>

          {/* 3-column layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Task list area */}
            <main className="flex-1 flex flex-col overflow-hidden border-r border-[var(--border)] mb-16 lg:mb-0">
              {children}
            </main>

            {/* Right detail pane (desktop, shown when task selected) */}
            {selectedTaskId && (
              <div className="hidden lg:block flex-shrink-0">
                <TaskDetailPane />
              </div>
            )}
          </div>
        </div>

        {/* Overlays */}
        <CommandPalette />
        <FocusMode />
        <NotificationSetup />

        {/* Mobile nav */}
        <MobileNav />
      </div>
    </ThemeProvider>
  );
}
