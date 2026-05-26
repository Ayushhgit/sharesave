import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FbUser,
} from 'firebase/auth';
import { getFirebase } from './firebase';
import type { User } from '@/types';
import { ENV } from '@/constants/env';
import { uid } from '@/utils/id';

function toUser(fb: FbUser): User {
  return {
    uid: fb.uid,
    email: fb.email ?? '',
    displayName: fb.displayName ?? undefined,
    photoURL: fb.photoURL ?? undefined,
    createdAt: fb.metadata.creationTime ?? new Date().toISOString(),
  };
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ user: User; token: string }> {
    if (ENV.USE_MOCKS) {
      return {
        user: {
          uid: uid('usr'),
          email,
          displayName: displayName ?? email.split('@')[0],
          createdAt: new Date().toISOString(),
        },
        token: 'mock-token',
      };
    }
    const { auth } = getFirebase();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    const token = await cred.user.getIdToken();
    return { user: toUser(cred.user), token };
  },

  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    if (ENV.USE_MOCKS) {
      return {
        user: {
          uid: uid('usr'),
          email,
          displayName: email.split('@')[0],
          createdAt: new Date().toISOString(),
        },
        token: 'mock-token',
      };
    }
    const { auth } = getFirebase();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    return { user: toUser(cred.user), token };
  },

  async signOut(): Promise<void> {
    if (ENV.USE_MOCKS) return;
    const { auth } = getFirebase();
    await signOut(auth);
  },

  subscribe(cb: (user: User | null) => void): () => void {
    if (ENV.USE_MOCKS) return () => undefined;
    const { auth } = getFirebase();
    return onAuthStateChanged(auth, (fb) => cb(fb ? toUser(fb) : null));
  },
};
