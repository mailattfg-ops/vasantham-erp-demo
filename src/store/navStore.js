import { create } from 'zustand'

export const useNavStore = create((set) => ({
  activeMenu: 'dashboard',
  setActiveMenu: (menu) => set({ activeMenu: menu }),
}))
