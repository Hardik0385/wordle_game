import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  guessesDistribution: Record<number, number>; // e.g., { 1: 0, 2: 5, 3: 10, ... }
  fastestSolve: number | null; // in seconds
  totalXP: number;
  level: number;
  unlockedAchievements: string[];
}

interface PlayerState {
  name: string;
  hasPromptedName: boolean;
  stats: GameStats;
  
  // Actions
  recordGameResult: (won: boolean, numGuesses: number, durationSeconds?: number) => void;
  setName: (name: string) => void;
  setHasPromptedName: (hasPrompted: boolean) => void;
}

const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  fastestSolve: null,
  totalXP: 0,
  level: 1,
  unlockedAchievements: [],
};

import { toast } from 'react-hot-toast';

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      name: '',
      hasPromptedName: false,
      stats: INITIAL_STATS,

      setName: (name) => set({ name }),
      setHasPromptedName: (hasPromptedName) => set({ hasPromptedName }),

      recordGameResult: (won, numGuesses, durationSeconds) => {
        const { stats } = get();
        const newStats = { ...stats };

        newStats.gamesPlayed += 1;

        if (won) {
          newStats.gamesWon += 1;
          newStats.currentStreak += 1;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
          
          if (newStats.guessesDistribution[numGuesses] !== undefined) {
            newStats.guessesDistribution[numGuesses] += 1;
          } else {
            newStats.guessesDistribution[numGuesses] = 1;
          }

          if (durationSeconds && (!newStats.fastestSolve || durationSeconds < newStats.fastestSolve)) {
            newStats.fastestSolve = durationSeconds;
          }

          // Simple XP calculation: faster + fewer guesses = more XP
          // Base win: +100. Minus 10 per guess taken.
          const xpGained = 100 + ( (6 - numGuesses) * 20 );
          newStats.totalXP += xpGained;
          
          // Basic level up logic: level = floor(sqrt(totalXP / 100)) + 1
          newStats.level = Math.floor(Math.sqrt(newStats.totalXP / 100)) + 1;
          
          // Check Achievements
          const achievements = [
            { id: 'first_win', name: 'First Win', reqGamesWon: 1 },
            { id: 'on_fire', name: 'On Fire', reqStreak: 5 },
            { id: 'unstoppable', name: 'Unstoppable', reqStreak: 20 },
            { id: 'word_master', name: 'Word Master', reqGamesWon: 100 },
          ];

          if (!newStats.unlockedAchievements) newStats.unlockedAchievements = [];

          achievements.forEach(ach => {
            if (!newStats.unlockedAchievements.includes(ach.id)) {
              let unlocked = false;
              if (ach.reqGamesWon && newStats.gamesWon >= ach.reqGamesWon) unlocked = true;
              if (ach.reqStreak && newStats.bestStreak >= ach.reqStreak) unlocked = true;
              
              if (unlocked) {
                newStats.unlockedAchievements.push(ach.id);
                setTimeout(() => {
                  toast.success(`Achievement Unlocked: ${ach.name}! 🏆`, { duration: 4000 });
                }, 1000); // slight delay so it doesn't collide with the win modal immediately
              }
            }
          });

        } else {
          newStats.currentStreak = 0;
          newStats.totalXP += 10; // Loss consolation XP
        }

        set({ stats: newStats });
      }
    }),
    {
      name: 'wordly-player-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          const oldName = persistedState?.name;
          const isHardcodedDefault = oldName === 'Hardik';
          return {
            ...persistedState,
            name: isHardcodedDefault ? '' : (oldName || ''),
            hasPromptedName: !isHardcodedDefault && !!oldName,
          };
        }
        return persistedState;
      },
    }
  )
);
