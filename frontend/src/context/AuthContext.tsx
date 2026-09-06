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
import { usePlayerStore } from '@/store/player-store';
import toast from 'react-hot-toast';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
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
  syncLocalStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  syncLocalStats: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync local offline stats into Firestore profile
  const syncWithFirestore = async (currentUser: User) => {
    try {
      const localStats = usePlayerStore.getState().stats;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};

      // Merge: take whichever is higher between cloud and local
      const gamesPlayed = Math.max(existingData.gamesPlayed ?? 0, localStats.gamesPlayed ?? 0);
      const gamesWon = Math.max(existingData.gamesWon ?? 0, localStats.gamesWon ?? 0);
      
      const calculatedRating = Math.max(1000, 1200 + (gamesWon * 25) - ((gamesPlayed - gamesWon) * 10));
      const rating = existingData.rating ?? calculatedRating;

      const mergedProfile: UserProfile = {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        rating,
        gamesPlayed,
        gamesWon,
      };

      await setDoc(
        userDocRef, 
        {
          ...mergedProfile,
          lastLoginAt: serverTimestamp(),
          ...(!docSnap.exists() ? { createdAt: serverTimestamp() } : {}),
        }, 
        { merge: true }
      );

      setProfile(mergedProfile);
    } catch (error) {
      console.error('Error fetching/syncing user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncWithFirestore(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncLocalStats = async () => {
    if (user) {
      await syncWithFirestore(user);
      toast.success('Synced your local stats to Cloud!');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncWithFirestore(result.user);
      }
      toast.success('Signed in with Google & stats synced!');
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
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, syncLocalStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
