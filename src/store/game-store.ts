import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { evaluateGuess, EvaluatedLetter } from '../engine/guess-evaluator';
import { isValidWord, getRandomWord, validateHardMode } from '../engine/word-validator';
import { usePlayerStore } from './player-store';
import { useSettingsStore } from './settings-store';

export type GameStatus = 'playing' | 'won' | 'lost';
export type GameMode = 'classic' | 'daily' | 'unlimited' | 'timed' | 'survival' | 'endless' | 'chaos' | 'custom';

export interface ChaosModifier {
  id: 'fog' | 'speed' | 'vowel' | 'banned' | 'sudden_death';
  name: string;
  description: string;
  icon: string;
  letter?: string;
}

const CHAOS_MODIFIERS: ChaosModifier[] = [
  { id: 'fog', name: 'Fog of War', description: 'Tile colors fade away after 3 seconds! Test your memory.', icon: '🌫️' },
  { id: 'speed', name: 'Speed Rush', description: 'Only 35 seconds to solve before explosion!', icon: '⚡' },
  { id: 'vowel', name: 'Vowel Lock', description: 'Every guess must contain at least 2 vowels!', icon: '🎯' },
  { id: 'banned', name: 'Cursed Letter', description: 'Letter is cursed and strictly forbidden!', icon: '🚫' },
  { id: 'sudden_death', name: 'Sudden Death', description: 'Only 4 attempts to guess the word!', icon: '💀' },
];

const CURSED_LETTERS = ['E', 'A', 'R', 'T', 'S', 'O', 'I'];

function getRandomChaosModifier(): ChaosModifier {
  const mod = CHAOS_MODIFIERS[Math.floor(Math.random() * CHAOS_MODIFIERS.length)];
  if (mod.id === 'banned') {
    const letter = CURSED_LETTERS[Math.floor(Math.random() * CURSED_LETTERS.length)];
    return { ...mod, letter, description: `Letter '${letter}' is cursed and cannot be used!` };
  }
  return { ...mod };
}

interface GameState {
  gameMode: GameMode;
  targetWord: string;
  wordLength: number;
  guesses: string[];
  maxGuesses: number;
  currentGuess: string;
  status: GameStatus;
  error: string | null;
  hints: string[];

  // Mode-specific state
  // Timed
  timerSeconds: number;
  timerMaxSeconds: number;
  timerRunning: boolean;

  // Survival
  survivalLives: number;
  survivalMaxLives: number;
  survivalStreak: number;
  survivalBest: number;

  // Endless
  endlessStage: number;
  endlessScore: number;

  // Chaos
  chaosModifier: ChaosModifier | null;

  // Custom
  customWordLength: number;
  customMaxGuesses: number;
  customChallengeWord: string | null;
  
  // Actions
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  setGameMode: (mode: GameMode, options?: { wordLength?: number; maxGuesses?: number; customTarget?: string }) => void;
  resetGame: (newTarget?: string, maxGuesses?: number, wordLength?: number) => void;
  clearError: () => void;
  useHint: () => void;
  tickTimer: () => void;
  nextSurvivalWord: () => void;
  nextEndlessStage: () => void;
  nextChaosWord: () => void;
  configureCustom: (length: number, maxGuesses: number, secretWord?: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameMode: 'classic',
      targetWord: getRandomWord(5),
      wordLength: 5,
      guesses: [],
      maxGuesses: 6,
      currentGuess: '',
      status: 'playing',
      error: null,
      hints: [],

      // Timed
      timerSeconds: 60,
      timerMaxSeconds: 60,
      timerRunning: false,

      // Survival
      survivalLives: 3,
      survivalMaxLives: 3,
      survivalStreak: 0,
      survivalBest: 0,

      // Endless
      endlessStage: 1,
      endlessScore: 0,

      // Chaos
      chaosModifier: null,

      // Custom
      customWordLength: 5,
      customMaxGuesses: 6,
      customChallengeWord: null,

      addLetter: (letter) => {
        const { currentGuess, targetWord, status, gameMode, chaosModifier } = get();
        if (status !== 'playing') return;

        // Chaos mode banned letter check
        if (gameMode === 'chaos' && chaosModifier?.id === 'banned' && chaosModifier.letter === letter.toUpperCase()) {
          set({ error: `Letter '${chaosModifier.letter}' is cursed!` });
          return;
        }

        if (currentGuess.length < targetWord.length) {
          set({ currentGuess: currentGuess + letter.toUpperCase(), error: null });
        }
      },

      removeLetter: () => {
        const { currentGuess, status } = get();
        if (status !== 'playing') return;
        if (currentGuess.length > 0) {
          set({ currentGuess: currentGuess.slice(0, -1), error: null });
        }
      },

      submitGuess: () => {
        const { currentGuess, targetWord, guesses, maxGuesses, status, gameMode, chaosModifier, timerSeconds, timerMaxSeconds, survivalLives, survivalStreak, survivalBest, endlessStage, endlessScore } = get();
        if (status !== 'playing') return;
        
        if (currentGuess.length !== targetWord.length) {
          set({ error: 'Not enough letters' });
          return;
        }

        if (!isValidWord(currentGuess)) {
          set({ error: 'Not in word list' });
          return;
        }

        // Chaos Mode rule check: Vowel lock
        if (gameMode === 'chaos' && chaosModifier?.id === 'vowel') {
          const vowelCount = (currentGuess.match(/[AEIOU]/g) || []).length;
          if (vowelCount < 2) {
            set({ error: 'Chaos Rule: Must contain at least 2 vowels!' });
            return;
          }
        }

        // Chaos Mode rule check: Banned letter in whole word
        if (gameMode === 'chaos' && chaosModifier?.id === 'banned' && chaosModifier.letter && currentGuess.includes(chaosModifier.letter)) {
          set({ error: `Chaos Rule: Cursed letter '${chaosModifier.letter}' detected!` });
          return;
        }

        const isHardMode = useSettingsStore.getState().hardMode;
        if (isHardMode && guesses.length > 0) {
          const lastGuess = guesses[guesses.length - 1];
          const hardModeError = validateHardMode(currentGuess, lastGuess, targetWord);
          if (hardModeError) {
            set({ error: hardModeError });
            return;
          }
        }

        const newGuesses = [...guesses, currentGuess];
        let newStatus: GameStatus = status;

        if (currentGuess === targetWord) {
          newStatus = 'won';

          // Mode-specific win rewards & progression
          if (gameMode === 'survival') {
            const nextStreak = survivalStreak + 1;
            const nextBest = nextBestStreak(survivalBest, nextStreak);
            set({ survivalStreak: nextStreak, survivalBest: nextBest });
            usePlayerStore.getState().recordGameResult(true, newGuesses.length);
          } else if (gameMode === 'endless') {
            const stagePoints = (endlessStage * 150) + ((maxGuesses - newGuesses.length) * 35);
            set({ endlessScore: endlessScore + stagePoints });
            usePlayerStore.getState().recordGameResult(true, newGuesses.length);
          } else if (gameMode === 'timed') {
            const timeBonus = Math.floor((timerSeconds / timerMaxSeconds) * 50);
            usePlayerStore.getState().recordGameResult(true, newGuesses.length, timerMaxSeconds - timerSeconds);
            // extra XP for fast solve
            if (timeBonus > 0) {
              usePlayerStore.setState(prev => ({
                stats: { ...prev.stats, totalXP: prev.stats.totalXP + timeBonus }
              }));
            }
          } else {
            usePlayerStore.getState().recordGameResult(true, newGuesses.length);
          }
        } else if (newGuesses.length >= maxGuesses) {
          newStatus = 'lost';

          if (gameMode === 'survival') {
            const remainingLives = survivalLives - 1;
            set({ survivalLives: Math.max(0, remainingLives) });
            usePlayerStore.getState().recordGameResult(false, newGuesses.length);
          } else {
            usePlayerStore.getState().recordGameResult(false, newGuesses.length);
          }
        }

        set({
          guesses: newGuesses,
          currentGuess: '',
          status: newStatus,
          error: null,
          timerRunning: newStatus === 'playing',
        });
      },

      setGameMode: (mode, options) => {
        let length = options?.wordLength || 5;
        let guesses = options?.maxGuesses || 6;
        let timerMax = 60;
        let chaosMod: ChaosModifier | null = null;

        if (mode === 'timed') {
          timerMax = 60;
        } else if (mode === 'survival') {
          // Keep current survival run if in progress, else reset
          const current = get();
          if (current.survivalLives <= 0) {
            set({ survivalLives: 3, survivalStreak: 0 });
          }
        } else if (mode === 'endless') {
          const current = get();
          const stage = current.endlessStage || 1;
          const config = getEndlessConfig(stage);
          length = config.length;
          guesses = config.guesses;
        } else if (mode === 'chaos') {
          chaosMod = getRandomChaosModifier();
          if (chaosMod.id === 'speed') timerMax = 35;
          if (chaosMod.id === 'sudden_death') guesses = 4;
        } else if (mode === 'custom') {
          length = options?.wordLength || get().customWordLength || 5;
          guesses = options?.maxGuesses || get().customMaxGuesses || 6;
        }

        const target = options?.customTarget ? options.customTarget.toUpperCase() : getRandomWord(length);

        set({
          gameMode: mode,
          wordLength: length,
          maxGuesses: guesses,
          targetWord: target,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
          timerSeconds: timerMax,
          timerMaxSeconds: timerMax,
          timerRunning: mode === 'timed' || (mode === 'chaos' && chaosMod?.id === 'speed'),
          chaosModifier: chaosMod,
          customChallengeWord: options?.customTarget || null,
        });
      },

      resetGame: (newTarget, customMaxGuesses, customWordLength) => {
        const { gameMode, wordLength, maxGuesses, endlessStage } = get();
        let targetLen = customWordLength || wordLength;
        let allowedGuesses = customMaxGuesses || maxGuesses;
        let timerMax = 60;
        let chaosMod: ChaosModifier | null = null;

        if (gameMode === 'endless') {
          const config = getEndlessConfig(endlessStage);
          targetLen = config.length;
          allowedGuesses = config.guesses;
        } else if (gameMode === 'chaos') {
          chaosMod = getRandomChaosModifier();
          if (chaosMod.id === 'speed') timerMax = 35;
          if (chaosMod.id === 'sudden_death') allowedGuesses = 4;
        } else if (gameMode === 'survival') {
          // If all lives were lost, reset to 3 lives
          if (get().survivalLives <= 0) {
            set({ survivalLives: 3, survivalStreak: 0 });
          }
        }

        const target = newTarget ? newTarget.toUpperCase() : getRandomWord(targetLen);

        set({
          targetWord: target,
          wordLength: targetLen,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
          maxGuesses: allowedGuesses,
          timerSeconds: timerMax,
          timerMaxSeconds: timerMax,
          timerRunning: gameMode === 'timed' || (gameMode === 'chaos' && chaosMod?.id === 'speed'),
          chaosModifier: chaosMod,
        });
      },

      tickTimer: () => {
        const { timerSeconds, status, targetWord } = get();
        if (status !== 'playing') return;

        if (timerSeconds <= 1) {
          set({
            timerSeconds: 0,
            timerRunning: false,
            status: 'lost',
            error: `Time's up! Word: ${targetWord}`,
          });
          usePlayerStore.getState().recordGameResult(false, get().guesses.length);
        } else {
          set({ timerSeconds: timerSeconds - 1 });
        }
      },

      nextSurvivalWord: () => {
        const target = getRandomWord(5);
        set({
          targetWord: target,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
          maxGuesses: 6,
        });
      },

      nextEndlessStage: () => {
        const nextStage = get().endlessStage + 1;
        const config = getEndlessConfig(nextStage);
        const target = getRandomWord(config.length);

        set({
          endlessStage: nextStage,
          wordLength: config.length,
          maxGuesses: config.guesses,
          targetWord: target,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
        });
      },

      nextChaosWord: () => {
        const chaosMod = getRandomChaosModifier();
        let guesses = 6;
        let timerMax = 60;
        if (chaosMod.id === 'speed') timerMax = 35;
        if (chaosMod.id === 'sudden_death') guesses = 4;

        set({
          targetWord: getRandomWord(5),
          wordLength: 5,
          maxGuesses: guesses,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
          chaosModifier: chaosMod,
          timerSeconds: timerMax,
          timerMaxSeconds: timerMax,
          timerRunning: chaosMod.id === 'speed',
        });
      },

      configureCustom: (length, maxGuesses, secretWord) => {
        const target = secretWord ? secretWord.toUpperCase() : getRandomWord(length);
        set({
          gameMode: 'custom',
          customWordLength: length,
          customMaxGuesses: maxGuesses,
          wordLength: length,
          maxGuesses: maxGuesses,
          targetWord: target,
          customChallengeWord: secretWord || null,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
        });
      },
      
      clearError: () => set({ error: null }),

      useHint: () => {
        const { targetWord, hints, status } = get();
        if (status !== 'playing') return;

        const playerState = usePlayerStore.getState();
        if (playerState.stats.totalXP < 50) {
          set({ error: 'Not enough XP for a hint (Need 50)' });
          return;
        }

        const targetLetters = targetWord.split('');
        const unrevealedLetters = targetLetters.filter(l => !hints.includes(l));

        if (unrevealedLetters.length === 0) {
          set({ error: 'All letters revealed' });
          return;
        }

        const hintLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
        
        usePlayerStore.setState(prev => ({
          stats: { ...prev.stats, totalXP: prev.stats.totalXP - 50 }
        }));

        set({ hints: [...hints, hintLetter], error: `Hint: Contains '${hintLetter}'` });
      }
    }),
    {
      name: 'wordly-game-storage',
    }
  )
);

function nextBestStreak(currentBest: number, currentStreak: number): number {
  return Math.max(currentBest || 0, currentStreak);
}

function getEndlessConfig(stage: number): { length: number; guesses: number } {
  if (stage === 1) return { length: 4, guesses: 6 };
  if (stage === 2) return { length: 5, guesses: 6 };
  if (stage === 3) return { length: 6, guesses: 6 };
  if (stage === 4) return { length: 5, guesses: 5 };
  if (stage === 5) return { length: 6, guesses: 5 };
  return { length: 6, guesses: 4 }; // Stage 6+ hard tier
}
