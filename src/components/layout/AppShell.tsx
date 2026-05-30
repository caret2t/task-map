"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/search/CommandPalette";
import { QuickCaptureModal } from "@/components/task/QuickCaptureModal";
import { TaskDetailPane } from "@/components/task/TaskDetailPane";
import { useTaskStore } from "@/store/taskStore";
import { useUIStore } from "@/store/uiStore";
import { Menu, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar, setQuickCaptureOpen } = useUIStore();
  const { selectedTaskId } = useTaskStore();

  // Open sidebar by default on desktop; auto-close on mobile resize
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      useUIStore.getState().setSidebarOpen(e.matches);
    };
    onChange(mq); // run once immediately
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Keyboard shortcut for sidebar
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
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block transition-all duration-200", sidebarOpen ? "w-64" : "w-0 overflow-hidden")}>
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

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-4 h-12">
          <button onClick={toggleSidebar} className="p-1">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-sm">TaskMap</span>
          <button onClick={() => setQuickCaptureOpen(true)} className="p-1">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Task list area */}
        <main className="flex-1 flex flex-col overflow-hidden mt-12 lg:mt-0 mb-16 lg:mb-0 border-r border-[var(--border)]">
          {children}
        </main>

        {/* Task detail pane (desktop) */}
        {selectedTaskId && <TaskDetailPane />}
      </div>

      {/* Overlays */}
      <CommandPalette />
      <QuickCaptureModal />

      {/* Mobile nav */}
      <MobileNav />
    </div>
  );
}
