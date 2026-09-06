'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase/config';
import { usePlayerStore, GameStats } from '@/store/player-store';
import { getDefaultAvatar } from '@/lib/avatars';
import toast from 'react-hot-toast';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string;
  bio?: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, bio: string, photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or initialize user profile strictly from Firestore (single source of truth)
  const loadAccountFromFirestore = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      const defaultAvatar = currentUser.photoURL || getDefaultAvatar(currentUser.uid);
      const defaultName = currentUser.displayName || 'Player';

      if (!docSnap.exists()) {
        // Brand new account: initialize clean cloud profile & stats
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          displayName: defaultName,
          email: currentUser.email,
          photoURL: defaultAvatar,
          bio: 'Wordle Enthusiast',
          rating: 1200,
          gamesPlayed: 0,
          gamesWon: 0,
        };

        await setDoc(userDocRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });

        setProfile(newProfile);
        // Load clean zero stats into player store
        usePlayerStore.getState().loadCloudStats({
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        }, newProfile.displayName);
      } else {
        // Existing account: strictly load account data from Firestore
        const data = docSnap.data();
        const existingProfile: UserProfile = {
          uid: currentUser.uid,
          displayName: data.displayName || defaultName,
          email: currentUser.email,
          photoURL: data.photoURL || defaultAvatar,
          bio: data.bio || 'Wordle Enthusiast',
          rating: data.rating ?? 1200,
          gamesPlayed: data.gamesPlayed ?? 0,
          gamesWon: data.gamesWon ?? 0,
        };

        // Update last login
        await setDoc(userDocRef, { 
          lastLoginAt: serverTimestamp(),
          // Ensure photoURL exists on doc
          ...(!data.photoURL ? { photoURL: defaultAvatar } : {})
        }, { merge: true });

        setProfile(existingProfile);

        // Load Firestore stats directly into the app state
        const cloudStats = data.stats || {};
        usePlayerStore.getState().loadCloudStats({
          gamesPlayed: data.gamesPlayed ?? 0,
          gamesWon: data.gamesWon ?? 0,
          currentStreak: cloudStats.currentStreak ?? 0,
          bestStreak: cloudStats.bestStreak ?? 0,
          guessesDistribution: cloudStats.guessesDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          fastestSolve: cloudStats.fastestSolve ?? null,
          totalXP: cloudStats.totalXP ?? (data.gamesWon ? data.gamesWon * 100 : 0),
          level: cloudStats.level ?? 1,
          unlockedAchievements: cloudStats.unlockedAchievements || [],
          dailyStreak: cloudStats.dailyStreak ?? 0,
          dailyBestStreak: cloudStats.dailyBestStreak ?? 0,
        }, existingProfile.displayName);
      }
    } catch (error) {
      console.error('Error loading account from Firestore:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadAccountFromFirestore(currentUser);
      } else {
        setProfile(null);
        // User logged out: wipe local stats so guest stats don't linger
        usePlayerStore.getState().resetToGuest();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (displayName: string, bio: string, photoURL: string) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: displayName.trim() || 'Player',
        bio: bio.trim(),
        photoURL,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setProfile((prev) => prev ? {
        ...prev,
        displayName: displayName.trim() || 'Player',
        bio: bio.trim(),
        photoURL,
      } : null);

      usePlayerStore.getState().setName(displayName.trim() || 'Player');
      toast.success('Profile updated successfully! ✨');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await loadAccountFromFirestore(result.user);
      }
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      usePlayerStore.getState().resetToGuest();
      toast.success('Signed out');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
