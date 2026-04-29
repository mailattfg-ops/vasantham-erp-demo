import { create } from 'zustand'

export const useNavStore = create((set) => ({
  activeMenu:     'dashboard',
  sidebarOpen:    false,
  setActiveMenu:  (menu) => set({ activeMenu: menu }),
  setSidebarOpen: (v)    => set({ sidebarOpen: v }),
  toggleSidebar:  ()     => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}))
