import { create } from "zustand";
import { persist } from "zustand/middleware";

type ActiveView = "inbox" | "today" | "upcoming" | "search" | "resources" | "archives" | "project" | "area";
export type ThemeMode = "system" | "light" | "dark";
export type ProjectViewMode = "list" | "board" | "calendar";

interface UIState {
  sidebarOpen: boolean;
  activeView: ActiveView;
  activeProjectId: string | null;
  activeAreaId: string | null;
  commandPaletteOpen: boolean;
  quickCaptureOpen: boolean;
  inlineAddOpen: boolean;
  theme: ThemeMode;
  focusModeOpen: boolean;
  focusTaskId: string | null;
  projectViewMode: ProjectViewMode;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveView: (view: ActiveView, id?: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  setInlineAddOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  enterFocusMode: (taskId: string) => void;
  exitFocusMode: () => void;
  setProjectViewMode: (mode: ProjectViewMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeView: "inbox",
      activeProjectId: null,
      activeAreaId: null,
      commandPaletteOpen: false,
      quickCaptureOpen: false,
      inlineAddOpen: false,
      theme: "system",
      focusModeOpen: false,
      focusTaskId: null,
      projectViewMode: "list",

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setActiveView: (view, id) =>
        set({
          activeView: view,
          activeProjectId: view === "project" ? (id ?? null) : null,
          activeAreaId: view === "area" ? (id ?? null) : null,
        }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),
      setInlineAddOpen: (open) => set({ inlineAddOpen: open }),
      setTheme: (theme) => set({ theme }),
      enterFocusMode: (taskId) => set({ focusModeOpen: true, focusTaskId: taskId }),
      exitFocusMode: () => set({ focusModeOpen: false, focusTaskId: null }),
      setProjectViewMode: (mode) => set({ projectViewMode: mode }),
    }),
    {
      name: "taskmap-ui",
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);
