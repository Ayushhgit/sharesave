import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth';
import { getFirebase } from '@/services/firebase';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  const signIn = async (email: string, password: string) => {
    const { user, token } = await authService.signIn(email, password);
    setSession(user, token);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { user, token } = await authService.signUp(email, password, displayName);
    setSession(user, token);
  };

  const signOut = async () => {
    await authService.signOut();
    clear();
  };

  return { user, token, hydrated, signIn, signUp, signOut, isAuthed: Boolean(user) };
}

export function useAuthSubscription() {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  useEffect(() => {
    const unsub = authService.subscribe(async (u) => {
      setUser(u);
      // Keep the stored token fresh when auth state changes
      if (u) {
        try {
          const { auth } = getFirebase();
          if (auth.currentUser) {
            const freshToken = await auth.currentUser.getIdToken();
            setToken(freshToken);
          }
        } catch {
          // token refresh failed — interceptor will handle it
        }
      }
    });
    return unsub;
  }, [setUser, setToken]);
}
