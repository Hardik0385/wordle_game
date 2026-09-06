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
  // Daily-specific streak tracking
  dailyStreak: number;
  dailyBestStreak: number;
  lastDailyCompletedDate: string | null; // IST date string YYYY-MM-DD
}

interface PlayerState {
  name: string;
  hasPromptedName: boolean;
  stats: GameStats;
  
  // Actions
  recordGameResult: (won: boolean, numGuesses: number, durationSeconds?: number) => void;
  recordDailyResult: (won: boolean, dateIST: string, numGuesses: number) => void;
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
  dailyStreak: 0,
  dailyBestStreak: 0,
  lastDailyCompletedDate: null,
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
      recordDailyResult: (won, dateIST, numGuesses) => {
        const { stats } = get();
        const newStats = { ...stats };

        // Guard: only record once per day
        if (newStats.lastDailyCompletedDate === dateIST) return;

        newStats.gamesPlayed += 1;
        newStats.lastDailyCompletedDate = dateIST;

        if (won) {
          newStats.gamesWon += 1;

          // Daily streak: check if yesterday was also completed
          // We just always increment here since the game-store blocks replaying
          newStats.dailyStreak = (newStats.dailyStreak || 0) + 1;
          newStats.dailyBestStreak = Math.max(newStats.dailyBestStreak || 0, newStats.dailyStreak);
          
          // Also update overall streak
          newStats.currentStreak += 1;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);

          if (newStats.guessesDistribution[numGuesses] !== undefined) {
            newStats.guessesDistribution[numGuesses] += 1;
          } else {
            newStats.guessesDistribution[numGuesses] = 1;
          }

          const xpGained = 150 + ((6 - numGuesses) * 20); // Daily gives bonus XP
          newStats.totalXP += xpGained;
          newStats.level = Math.floor(Math.sqrt(newStats.totalXP / 100)) + 1;

          const achievements = [
            { id: 'first_win', name: 'First Win', reqGamesWon: 1 },
            { id: 'on_fire', name: 'On Fire', reqStreak: 5 },
            { id: 'unstoppable', name: 'Unstoppable', reqStreak: 20 },
            { id: 'word_master', name: 'Word Master', reqGamesWon: 100 },
            { id: 'daily_devotee', name: 'Daily Devotee', reqDailyStreak: 7 },
          ] as any[];

          if (!newStats.unlockedAchievements) newStats.unlockedAchievements = [];

          achievements.forEach((ach: any) => {
            if (!newStats.unlockedAchievements.includes(ach.id)) {
              let unlocked = false;
              if (ach.reqGamesWon && newStats.gamesWon >= ach.reqGamesWon) unlocked = true;
              if (ach.reqStreak && newStats.bestStreak >= ach.reqStreak) unlocked = true;
              if (ach.reqDailyStreak && newStats.dailyStreak >= ach.reqDailyStreak) unlocked = true;

              if (unlocked) {
                newStats.unlockedAchievements.push(ach.id);
                setTimeout(() => {
                  toast.success(`Achievement Unlocked: ${ach.name}! 🏆`, { duration: 4000 });
                }, 1000);
              }
            }
          });
        } else {
          // Lost daily: reset daily streak
          newStats.dailyStreak = 0;
          newStats.currentStreak = 0;
          newStats.totalXP += 10;
        }

        set({ stats: newStats });
      },

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
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          const oldName = persistedState?.name;
          const isHardcodedDefault = oldName === 'Hardik';
          persistedState = {
            ...persistedState,
            name: isHardcodedDefault ? '' : (oldName || ''),
            hasPromptedName: !isHardcodedDefault && !!oldName,
          };
        }
        if (version < 3) {
          // Add daily streak fields to existing stats
          persistedState = {
            ...persistedState,
            stats: {
              ...persistedState.stats,
              dailyStreak: persistedState.stats?.dailyStreak ?? 0,
              dailyBestStreak: persistedState.stats?.dailyBestStreak ?? 0,
              lastDailyCompletedDate: persistedState.stats?.lastDailyCompletedDate ?? null,
            },
          };
        }
        return persistedState;
      },
    }
  )
);
