'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  isFirebaseConfigured,
  onAuthChange,
  signInWithGoogle,
  signOutUser,
} from '@/lib/firebase';

export interface OrbitAuthState {
  user: User | null;
  authLoading: boolean;
  isFirebaseReady: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

export function useOrbitAuth(): OrbitAuthState {
  const isFirebaseReady = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => isFirebaseReady);

  useEffect(() => {
    if (!isFirebaseReady) return;

    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const signIn = useCallback(async () => {
    try {
      const u = await signInWithGoogle();
      return u;
    } catch (err) {
      console.error('Sign-in error:', err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  }, []);

  return {
    user,
    authLoading,
    isFirebaseReady,
    signIn,
    signOut,
  };
}
