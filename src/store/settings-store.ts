import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: string;
  wordLength: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  hardMode: boolean;
  soundEnabled: boolean;
  
  // Actions
  setTheme: (theme: string) => void;
  setWordLength: (length: number) => void;
  setDifficulty: (diff: 'easy' | 'normal' | 'hard' | 'expert') => void;
  toggleHardMode: () => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'classic',
      wordLength: 5,
      difficulty: 'normal',
      hardMode: false,
      soundEnabled: true,
      
      setTheme: (theme) => set({ theme }),
      setWordLength: (wordLength) => set({ wordLength }),
      setDifficulty: (difficulty) => set({ difficulty }),
      toggleHardMode: () => set((state) => ({ hardMode: !state.hardMode })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'wordly-settings-storage',
    }
  )
);
