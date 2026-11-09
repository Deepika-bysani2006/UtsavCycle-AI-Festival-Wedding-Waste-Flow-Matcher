import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile, setUserRole } from '../lib/firestore';
import { syncUserToMongoDB } from '../lib/api';
import type { UserProfile } from '../types';

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (role?: 'ORGANIZER' | 'RECOVERY_PARTNER') => Promise<void>;
  signInWithEmail: (email: string, password: string, role?: 'ORGANIZER' | 'RECOVERY_PARTNER') => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, role?: 'ORGANIZER' | 'RECOVERY_PARTNER') => Promise<void>;
  signInAsDemoUser: (name?: string, email?: string, role?: 'ORGANIZER' | 'RECOVERY_PARTNER') => Promise<void>;
  updateUserRole: (role: 'ORGANIZER' | 'RECOVERY_PARTNER') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function withTimeout<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T | null> {
  return Promise.race([
    promise.catch(() => null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

function getStoredDemoData() {
  try {
    const raw = localStorage.getItem('uc_demo_user');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};

    if (auth) {
      try {
        unsub = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // Real authenticated Google / Firebase user
            try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
            setCurrentUser(firebaseUser);

            const profile = await withTimeout(getUserProfile(firebaseUser.uid));
            if (profile) {
              setUserProfile(profile);
              syncUserToMongoDB(profile);
            } else {
              const freshProfile: UserProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
                role: 'ORGANIZER',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setUserProfile(freshProfile);
              syncUserToMongoDB(freshProfile);
            }
          } else {
            // Check if user explicitly chose Demo User
            const storedDemo = getStoredDemoData();
            if (storedDemo?.user && storedDemo?.profile) {
              setCurrentUser(storedDemo.user);
              setUserProfile(storedDemo.profile);
            } else {
              setCurrentUser(null);
              setUserProfile(null);
            }
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn('onAuthStateChanged error:', err);
        setLoading(false);
      }
    } else {
      const storedDemo = getStoredDemoData();
      if (storedDemo?.user && storedDemo?.profile) {
        setCurrentUser(storedDemo.user);
        setUserProfile(storedDemo.profile);
      }
      setLoading(false);
    }

    const safetyTimer = setTimeout(() => setLoading(false), 2500);

    return () => {
      try { unsub(); } catch { /* ignore */ }
      clearTimeout(safetyTimer);
    };
  }, []);

  async function signInWithGoogle(role: 'ORGANIZER' | 'RECOVERY_PARTNER' = 'ORGANIZER') {
    // Clear any previous demo state
    try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Build real user profile using real Google account data
    const realProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Immediately set real user in React context
    setCurrentUser(user);
    setUserProfile(realProfile);

    // Sync to MongoDB Atlas database
    syncUserToMongoDB(realProfile);

    // Save to Firestore
    try {
      await createUserProfile(realProfile);
      await setUserRole(user.uid, role);
    } catch (e) {
      console.warn('Firestore profile sync warning:', e);
    }
  }

  async function signInWithEmail(email: string, password: string, role?: 'ORGANIZER' | 'RECOVERY_PARTNER') {
    try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    setCurrentUser(user);
    const profile = await withTimeout(getUserProfile(user.uid));
    if (profile) {
      if (role && profile.role !== role) {
        await updateUserRole(role);
      } else {
        setUserProfile(profile);
        syncUserToMongoDB(profile);
      }
    } else {
      const fresh: UserProfile = {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email,
        photoURL: '',
        role: role || 'ORGANIZER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUserProfile(fresh);
      syncUserToMongoDB(fresh);
    }
  }

  async function signUpWithEmail(email: string, password: string, name: string, role: 'ORGANIZER' | 'RECOVERY_PARTNER' = 'ORGANIZER') {
    try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    const user = result.user;
    const freshProfile: UserProfile = {
      uid: user.uid,
      name,
      email,
      photoURL: '',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentUser(user);
    setUserProfile(freshProfile);
    syncUserToMongoDB(freshProfile);
    try {
      await createUserProfile(freshProfile);
    } catch (e) {
      console.warn('Firestore profile creation warning:', e);
    }
  }

  async function signInAsDemoUser(
    name = 'Demo User',
    email = 'user@utsavcycle.ai',
    role: 'ORGANIZER' | 'RECOVERY_PARTNER' = 'ORGANIZER'
  ) {
    const isPartner = role === 'RECOVERY_PARTNER';
    const defaultName = isPartner ? 'Demo Recovery Partner' : 'Demo Event Organizer';
    const defaultEmail = isPartner ? 'partner@utsavcycle.ai' : 'organizer@utsavcycle.ai';

    const demoUser: any = {
      uid: isPartner ? 'demo_partner_123' : 'demo_organizer_123',
      email: email.includes('@') && email !== 'user@utsavcycle.ai' ? email : defaultEmail,
      displayName: name && name !== 'Demo User' ? name : defaultName,
      photoURL: '',
    };
    const demoProfile: UserProfile = {
      uid: demoUser.uid,
      name: demoUser.displayName,
      email: demoUser.email,
      photoURL: '',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
    syncUserToMongoDB(demoProfile);
    try {
      localStorage.setItem('uc_demo_user', JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch { /* ignore */ }
  }

  async function updateUserRole(role: 'ORGANIZER' | 'RECOVERY_PARTNER') {
    if (!currentUser) return;

    const updatedProfile: UserProfile = {
      uid: currentUser.uid,
      name: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      email: userProfile?.email || currentUser.email || '',
      photoURL: userProfile?.photoURL || currentUser.photoURL || '',
      role,
      createdAt: userProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    setUserProfile(updatedProfile);
    syncUserToMongoDB(updatedProfile);

    if (!currentUser.uid.startsWith('demo')) {
      try {
        await setUserRole(currentUser.uid, role);
      } catch (e) {
        console.warn('setUserRole warning:', e);
      }
    } else {
      try {
        localStorage.setItem('uc_demo_user', JSON.stringify({ user: currentUser, profile: updatedProfile }));
      } catch { /* ignore */ }
    }
  }

  async function logout() {
    try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
    if (auth) {
      try { await signOut(auth); } catch { /* ignore */ }
    }
    setCurrentUser(null);
    setUserProfile(null);
  }

  async function refreshProfile() {
    if (currentUser && !currentUser.uid.startsWith('demo')) {
      const profile = await withTimeout(getUserProfile(currentUser.uid));
      if (profile) {
        setUserProfile(profile);
        syncUserToMongoDB(profile);
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInAsDemoUser,
      updateUserRole,
      logout,
      refreshProfile,
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
