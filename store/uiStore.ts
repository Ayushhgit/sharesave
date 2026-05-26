import { create } from 'zustand';

interface UIState {
  saveModalOpen: boolean;
  aiProcessing: boolean;
  reminderTargetId: string | null;
  openSave: () => void;
  closeSave: () => void;
  setAiProcessing: (b: boolean) => void;
  openReminder: (id: string) => void;
  closeReminder: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  saveModalOpen: false,
  aiProcessing: false,
  reminderTargetId: null,
  openSave: () => set({ saveModalOpen: true }),
  closeSave: () => set({ saveModalOpen: false }),
  setAiProcessing: (b) => set({ aiProcessing: b }),
  openReminder: (id) => set({ reminderTargetId: id }),
  closeReminder: () => set({ reminderTargetId: null }),
}));
