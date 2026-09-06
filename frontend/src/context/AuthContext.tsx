'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore';
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
  resetAccountStats: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  resetAccountStats: async () => {},
  deleteAccount: async () => {},
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
    let docUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }

      if (currentUser) {
        await loadAccountFromFirestore(currentUser);

        // Real-time listener: instantly reflect ELO, wins, and stats from solo and duel games!
        const userDocRef = doc(db, 'users', currentUser.uid);
        docUnsub = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfile((prev) => prev ? {
              ...prev,
              rating: data.rating ?? 1200,
              gamesPlayed: data.gamesPlayed ?? 0,
              gamesWon: data.gamesWon ?? 0,
              duelWins: data.duelWins ?? 0,
              duelLosses: data.duelLosses ?? 0,
            } : null);
          }
        });
      } else {
        setProfile(null);
        // User logged out: wipe local stats so guest stats don't linger
        usePlayerStore.getState().resetToGuest();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (docUnsub) docUnsub();
    };
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

  const resetAccountStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        rating: 1200,
        gamesPlayed: 0,
        gamesWon: 0,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        },
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setProfile((prev) => prev ? {
        ...prev,
        rating: 1200,
        gamesPlayed: 0,
        gamesWon: 0,
      } : null);

      usePlayerStore.getState().loadCloudStats({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      }, profile?.displayName || user.displayName || 'Player');

      toast.success('Account statistics successfully reset to default!');
    } catch (error: any) {
      console.error('Reset stats error:', error);
      toast.error(error.message || 'Failed to reset statistics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 1. Delete Firestore user document
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await deleteDoc(userDocRef);
      } catch (docErr: any) {
        console.warn('Firestore doc delete note:', docErr);
      }

      // 2. Clear local stores and storage
      usePlayerStore.getState().resetToGuest();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wordly-player-storage');
        localStorage.removeItem('wordly-game-storage');
      }

      // 3. Delete the Firebase Auth User
      try {
        await deleteUser(user);
      } catch (authErr: any) {
        if (authErr.code === 'auth/requires-recent-login') {
          // Reauthenticate with Google popup and retry delete
          const credential = await signInWithPopup(auth, googleProvider);
          if (credential.user) {
            await deleteUser(credential.user);
          }
        } else {
          throw authErr;
        }
      }

      setUser(null);
      setProfile(null);
      toast.success('Your account and cloud data have been permanently deleted.');
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
      throw error;
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
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithGoogle, 
      logout, 
      updateUserProfile,
      resetAccountStats,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
