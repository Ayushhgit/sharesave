import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedItem, IntentCategoryId, CollectionId, Reminder } from '@/types';

export type ViewMode = 'grid' | 'list';
export type SortMode = 'recent' | 'oldest' | 'category';

interface ItemsState {
  items: SavedItem[];
  view: ViewMode;
  sort: SortMode;
  query: string;
  activeCategory: IntentCategoryId | 'all';
  activeCollection: CollectionId | null;

  hydrate: (items: SavedItem[]) => void;
  add: (item: SavedItem) => void;
  update: (id: string, patch: Partial<SavedItem>) => void;
  remove: (id: string) => void;
  toggleAction: (itemId: string, actionId: string) => void;
  setReminder: (itemId: string, reminder: Reminder | undefined) => void;

  setView: (v: ViewMode) => void;
  setSort: (s: SortMode) => void;
  setQuery: (q: string) => void;
  setCategory: (c: IntentCategoryId | 'all') => void;
  setCollection: (c: CollectionId | null) => void;
}

export const useItemsStore = create<ItemsState>()(
  persist(
    (set) => ({
      items: [],
      view: 'grid',
      sort: 'recent',
      query: '',
      activeCategory: 'all',
      activeCollection: null,

      hydrate: (items) => set({ items }),
      add: (item) => set((s) => ({ items: [item, ...s.items] })),
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i
          ),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggleAction: (itemId, actionId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id !== itemId
              ? i
              : {
                  ...i,
                  actions: i.actions.map((a) =>
                    a.id === actionId ? { ...a, done: !a.done } : a
                  ),
                }
          ),
        })),
      setReminder: (itemId, reminder) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === itemId ? { ...i, reminder } : i)),
        })),

      setView: (view) => set({ view }),
      setSort: (sort) => set({ sort }),
      setQuery: (query) => set({ query }),
      setCategory: (activeCategory) => set({ activeCategory }),
      setCollection: (activeCollection) => set({ activeCollection }),
    }),
    {
      name: '@intent/items',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items, view: s.view, sort: s.sort }),
    }
  )
);
