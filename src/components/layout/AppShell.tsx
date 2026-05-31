"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeProvider } from "./ThemeProvider";
import { CommandPalette } from "@/components/search/CommandPalette";
import { TaskDetailPane } from "@/components/task/TaskDetailPane";
import { MobileTaskSheet } from "@/components/task/MobileTaskSheet";
import { FocusMode } from "@/components/focus/FocusMode";
import { NotificationSetup } from "./NotificationSetup";
import { useTaskStore } from "@/store/taskStore";
import { useUIStore, type ThemeMode } from "@/store/uiStore";
import { Sun, Moon, Monitor, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_CYCLE: ThemeMode[] = ["light", "system", "dark"];
const THEME_ICONS: Record<ThemeMode, React.ElementType> = { light: Sun, system: Monitor, dark: Moon };

// モバイル用シングルトグル
function MobileThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const Icon = THEME_ICONS[theme];
  const next = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };
  return (
    <button
      onClick={next}
      className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
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
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 16 16">
                  <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-sm">TaskMap</span>
            </div>
            <MobileThemeToggle />
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
        <MobileTaskSheet />
        <NotificationSetup />

        {/* Mobile nav */}
        <MobileNav />
      </div>
    </ThemeProvider>
  );
}
