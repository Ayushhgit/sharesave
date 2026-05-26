import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setSession: (user: User, token: string) => void;
  setToken: (token: string) => void;
  clear: () => void;
  setUser: (user: User | null) => void;
  setHydrated: (b: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setSession: (user, token) => set({ user, token }),
      setToken: (token) => set({ token }),
      clear: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
      setHydrated: (b) => set({ hydrated: b }),
    }),
    {
      name: '@intent/auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state, error) => {
        if (error && __DEV__) console.warn('[auth] rehydrate error', error);
        state?.setHydrated(true);
        if (!state) {
          // store ready even if no persisted state
          useAuthStore.setState({ hydrated: true });
        }
      },
    }
  )
);
