import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  inMemoryPersistence,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/constants/env';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function resolveRnPersistence(): Persistence {
  try {
    const mod = require('firebase/auth') as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
    };
    if (typeof mod.getReactNativePersistence === 'function') {
      return mod.getReactNativePersistence(AsyncStorage);
    }
  } catch {
    /* ignore */
  }
  return inMemoryPersistence;
}

export function getFirebase(): { app: FirebaseApp; auth: Auth } {
  if (!app) {
    const config = ENV.FIREBASE as Record<string, string>;
    app = getApps()[0] ?? initializeApp(config);
  }
  if (!auth) {
    try {
      auth = initializeAuth(app, { persistence: resolveRnPersistence() });
    } catch {
      auth = getAuth(app);
    }
  }
  return { app, auth };
}
