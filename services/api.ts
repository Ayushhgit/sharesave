import axios from 'axios';
import { ENV } from '@/constants/env';
import { useAuthStore } from '@/store/authStore';
import { getFirebase } from './firebase';

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  // Always try to get a fresh token from the live Firebase user first,
  // since the stored token may be expired (Firebase ID tokens last 1 hour).
  let token: string | null = null;
  try {
    const { auth } = getFirebase();
    const currentUser = auth.currentUser;
    if (currentUser) {
      token = await currentUser.getIdToken(/* forceRefresh */ false);
      // Also keep the store in sync so other parts of the app have it
      useAuthStore.getState().setToken(token);
    }
  } catch {
    // Fallback to the stored token if Firebase is unavailable
    token = useAuthStore.getState().token;
  }

  if (!token) {
    token = useAuthStore.getState().token;
  }

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only clear session on 401 if the token is definitely invalid,
    // not on transient network issues.
    if (error?.response?.status === 401) {
      console.warn('[api] 401 — token rejected by backend');
    }
    return Promise.reject(error);
  }
);

