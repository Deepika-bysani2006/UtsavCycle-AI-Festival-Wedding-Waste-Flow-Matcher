import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../lib/firestore';
import type { UserProfile } from '../types';

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Resolves with value or null after timeoutMs — never hangs the app */
function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T | null> {
  return Promise.race([
    promise.catch(() => null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Use timeout so a Firestore outage never freezes the loading screen
        const profile = await withTimeout(getUserProfile(user.uid));
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Safety net: if onAuthStateChanged itself never fires (offline / config error),
    // stop loading after 8 seconds so the user sees the login page instead of a spinner
    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    return () => {
      unsub();
      clearTimeout(safetyTimer);
    };
  }, []);

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    try {
      await createUserProfile({
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: 'ORGANIZER',
      });
      const profile = await withTimeout(getUserProfile(user.uid));
      setUserProfile(profile);
    } catch {
      // Profile fetch failure is non-fatal — user is still authenticated
    }
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    try {
      await createUserProfile({
        uid: result.user.uid,
        name,
        email,
        photoURL: '',
        role: 'ORGANIZER',
      });
      const profile = await withTimeout(getUserProfile(result.user.uid));
      setUserProfile(profile);
    } catch {
      // Non-fatal
    }
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  async function refreshProfile() {
    if (currentUser) {
      const profile = await withTimeout(getUserProfile(currentUser.uid));
      setUserProfile(profile);
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser, userProfile, loading,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
