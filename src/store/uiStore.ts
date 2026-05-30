import { create } from "zustand";

type ActiveView = "inbox" | "today" | "upcoming" | "search" | "resources" | "archives" | "project" | "area";

interface UIState {
  sidebarOpen: boolean;
  activeView: ActiveView;
  activeProjectId: string | null;
  activeAreaId: string | null;
  commandPaletteOpen: boolean;
  quickCaptureOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveView: (view: ActiveView, id?: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeView: "inbox",
  activeProjectId: null,
  activeAreaId: null,
  commandPaletteOpen: false,
  quickCaptureOpen: false,

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
}));
