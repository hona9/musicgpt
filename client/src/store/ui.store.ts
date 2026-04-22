import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activePromptId: string | null;
  profilePopupOpen: boolean;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActivePromptId: (id: string | null) => void;
  setProfilePopupOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  activePromptId: null,
  profilePopupOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActivePromptId: (id) => set({ activePromptId: id }),
  setProfilePopupOpen: (open) => set({ profilePopupOpen: open }),
}));
