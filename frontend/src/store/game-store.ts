import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { evaluateGuess, EvaluatedLetter } from '../engine/guess-evaluator';
import { isValidWord, getRandomWord, validateHardMode, getDailyWord } from '../engine/word-validator';
import { usePlayerStore } from './player-store';
import { useSettingsStore } from './settings-store';
import { sounds } from '../lib/sound';
import { formatHintMessage, formatNoHintsLeft, formatAllRevealed } from '../lib/translations';

/**
 * Returns the current calendar date string in IST (UTC+5:30).
 * The daily challenge refreshes at 5:30 AM IST (= 00:00 UTC).
 */
export function getDailyDateIST(): string {
  const now = new Date();
  // IST = UTC + 5 hours 30 minutes
  const istOffset = 5 * 60 + 30; // minutes
  const istMs = now.getTime() + istOffset * 60 * 1000;
  return new Date(istMs).toISOString().split('T')[0];
}

export interface PositionHint {
  index: number;
  letter: string;
}

export type GameStatus = 'playing' | 'won' | 'lost';
export type GameMode = 'classic' | 'daily' | 'unlimited' | 'timed' | 'survival' | 'endless' | 'chaos' | 'custom';

export interface ChaosModifier {
  id: 'fog' | 'speed' | 'vowel' | 'banned' | 'sudden_death';
  name: string;
  description: string;
  icon: string;
  letter?: string;
}

export interface ModeSavedState {
  targetWord: string;
  wordLength: number;
  guesses: string[];
  maxGuesses: number;
  currentGuess: string;
  status: GameStatus;
  hints: PositionHint[];
  hintsRemaining: number;
  timerSeconds: number;
  timerMaxSeconds: number;
  elapsedSeconds: number;
  survivalLives: number;
  survivalMaxLives: number;
  survivalStreak: number;
  survivalBest: number;
  endlessStage: number;
  endlessScore: number;
  chaosModifier: ChaosModifier | null;
  customChallengeWord: string | null;
  dailyDate?: string;
  savedAt: number;
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

function extractModeState(state: GameState): ModeSavedState {
  return {
    targetWord: state.targetWord,
    wordLength: state.wordLength,
    guesses: state.guesses,
    maxGuesses: state.maxGuesses,
    currentGuess: state.currentGuess,
    status: state.status,
    hints: state.hints,
    hintsRemaining: state.hintsRemaining,
    timerSeconds: state.timerSeconds,
    timerMaxSeconds: state.timerMaxSeconds,
    elapsedSeconds: state.elapsedSeconds,
    survivalLives: state.survivalLives,
    survivalMaxLives: state.survivalMaxLives,
    survivalStreak: state.survivalStreak,
    survivalBest: state.survivalBest,
    endlessStage: state.endlessStage,
    endlessScore: state.endlessScore,
    chaosModifier: state.chaosModifier,
    customChallengeWord: state.customChallengeWord,
    dailyDate: getDailyDateIST(),
    savedAt: Date.now(),
  };
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
  hints: PositionHint[];
  hintsRemaining: number;
  savedGamesByMode: Partial<Record<GameMode, ModeSavedState>>;

  // Timed & Stopwatch
  timerSeconds: number;
  timerMaxSeconds: number;
  timerRunning: boolean;
  elapsedSeconds: number;

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
  forfeitTimedGameIfActive: () => void;
  nextSurvivalWord: () => void;
  nextEndlessStage: () => void;
  nextChaosWord: () => void;
  configureCustom: (length: number, maxGuesses: number, secretWord?: string) => void;
  // Result modal visibility (not persisted — resets to false on every page load)
  resultModalSeen: boolean;
  dismissResultModal: () => void;
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
      hintsRemaining: 2,
      savedGamesByMode: {},
      // Result modal: starts unseen on every page load (not persisted)
      resultModalSeen: false,

      // Timed
      timerSeconds: 60,
      timerMaxSeconds: 60,
      timerRunning: false,
      elapsedSeconds: 0,

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
        
        const triggerFeedbackError = (msg: string) => {
          const { soundEnabled, hapticsEnabled } = useSettingsStore.getState();
          if (soundEnabled) sounds.playError();
          if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([20, 50, 20]);
          }
          set({ error: msg });
        };

        if (currentGuess.length !== targetWord.length) {
          triggerFeedbackError('Not enough letters');
          return;
        }

        const currentLang = useSettingsStore.getState().gameLanguage;
        if (!isValidWord(currentGuess, currentLang)) {
          triggerFeedbackError('Not in word list');
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
          if (useSettingsStore.getState().soundEnabled) {
            sounds.playWin();
          }

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
          } else if (gameMode === 'daily') {
            usePlayerStore.getState().recordDailyResult(true, getDailyDateIST(), newGuesses.length);
          } else {
            usePlayerStore.getState().recordGameResult(true, newGuesses.length);
          }
        } else if (newGuesses.length >= maxGuesses) {
          newStatus = 'lost';

          if (gameMode === 'survival') {
            const remainingLives = survivalLives - 1;
            set({ survivalLives: Math.max(0, remainingLives) });
            usePlayerStore.getState().recordGameResult(false, newGuesses.length);
          } else if (gameMode === 'daily') {
            usePlayerStore.getState().recordDailyResult(false, getDailyDateIST(), newGuesses.length);
          } else {
            usePlayerStore.getState().recordGameResult(false, newGuesses.length);
          }
        }

        const isTimedChallenge = gameMode === 'timed' || (gameMode === 'chaos' && chaosModifier?.id === 'speed');

        const updatedSavedGames = { ...get().savedGamesByMode };
        updatedSavedGames[gameMode] = {
          ...extractModeState(get()),
          guesses: newGuesses,
          currentGuess: '',
          status: newStatus,
        };

        set({
          guesses: newGuesses,
          currentGuess: '',
          status: newStatus,
          error: null,
          timerRunning: newStatus === 'playing' && isTimedChallenge,
          savedGamesByMode: updatedSavedGames,
          // Show modal fresh for this result; dismissed = false
          resultModalSeen: newStatus !== 'playing' ? false : get().resultModalSeen,
        });
      },

      forfeitTimedGameIfActive: () => {
        const current = get();
        const isTimedChallenge = current.gameMode === 'timed' || (current.gameMode === 'chaos' && current.chaosModifier?.id === 'speed');
        const hasStarted = current.guesses.length > 0 || current.timerSeconds < current.timerMaxSeconds;

        if (isTimedChallenge && current.status === 'playing' && hasStarted) {
          const updatedSaved = { ...current.savedGamesByMode };
          delete updatedSaved[current.gameMode];

          set({
            status: 'lost',
            timerRunning: false,
            error: "Timed challenge ended because you switched away.",
            savedGamesByMode: updatedSaved,
            resultModalSeen: false,
          });

          usePlayerStore.getState().recordGameResult(false, current.guesses.length);
        }
      },

      setGameMode: (mode, options) => {
        const current = get();
        const isCurrentTimed = current.gameMode === 'timed' || (current.gameMode === 'chaos' && current.chaosModifier?.id === 'speed');
        const currentStarted = current.guesses.length > 0 || current.timerSeconds < current.timerMaxSeconds;
        const updatedSaved = { ...current.savedGamesByMode };

        // 1. If departing from an active timed challenge that has started, forfeit it!
        if (isCurrentTimed && current.status === 'playing' && currentStarted && mode !== current.gameMode) {
          delete updatedSaved[current.gameMode];
          usePlayerStore.getState().recordGameResult(false, current.guesses.length);
        } else if (current.status === 'playing') {
          // Preserve departing non-timed game
          updatedSaved[current.gameMode] = extractModeState(current);
        }

        // If selecting the exact same mode and no custom options provided, and game is active, just keep it!
        if (mode === current.gameMode && !options && current.status === 'playing') {
          set({ savedGamesByMode: updatedSaved });
          return;
        }

        // 2. Check if the target mode has an in-progress game to restore
        const today = getDailyDateIST();
        const savedForNewMode = updatedSaved[mode];

        // For daily mode: if today's game is already completed (won or lost), restore it as-is (read-only)
        if (mode === 'daily' && savedForNewMode && savedForNewMode.dailyDate === today && savedForNewMode.status !== 'playing') {
          set({
            gameMode: mode,
            targetWord: savedForNewMode.targetWord,
            wordLength: savedForNewMode.wordLength,
            guesses: savedForNewMode.guesses,
            maxGuesses: savedForNewMode.maxGuesses,
            currentGuess: '',
            status: savedForNewMode.status,
            error: null,
            hints: savedForNewMode.hints,
            hintsRemaining: savedForNewMode.hintsRemaining,
            timerSeconds: savedForNewMode.timerSeconds,
            timerMaxSeconds: savedForNewMode.timerMaxSeconds,
            timerRunning: false,
            elapsedSeconds: savedForNewMode.elapsedSeconds,
            survivalLives: savedForNewMode.survivalLives,
            survivalMaxLives: savedForNewMode.survivalMaxLives,
            survivalStreak: savedForNewMode.survivalStreak,
            survivalBest: savedForNewMode.survivalBest,
            endlessStage: savedForNewMode.endlessStage,
            endlessScore: savedForNewMode.endlessScore,
            chaosModifier: savedForNewMode.chaosModifier,
            customChallengeWord: savedForNewMode.customChallengeWord,
            savedGamesByMode: updatedSaved,
            // Already completed — don't pop the result modal on re-navigation
            resultModalSeen: true,
          });
          return;
        }

        const canRestore = savedForNewMode && 
          savedForNewMode.status === 'playing' && 
          !options?.customTarget &&
          (mode !== 'daily' || savedForNewMode.dailyDate === today);

        if (canRestore) {
          set({
            gameMode: mode,
            targetWord: savedForNewMode.targetWord,
            wordLength: savedForNewMode.wordLength,
            guesses: savedForNewMode.guesses,
            maxGuesses: savedForNewMode.maxGuesses,
            currentGuess: savedForNewMode.currentGuess,
            status: savedForNewMode.status,
            error: null,
            hints: savedForNewMode.hints,
            hintsRemaining: savedForNewMode.hintsRemaining,
            timerSeconds: savedForNewMode.timerSeconds,
            timerMaxSeconds: savedForNewMode.timerMaxSeconds,
            timerRunning: mode === 'timed' || (mode === 'chaos' && savedForNewMode.chaosModifier?.id === 'speed'),
            elapsedSeconds: savedForNewMode.elapsedSeconds,
            survivalLives: savedForNewMode.survivalLives,
            survivalMaxLives: savedForNewMode.survivalMaxLives,
            survivalStreak: savedForNewMode.survivalStreak,
            survivalBest: savedForNewMode.survivalBest,
            endlessStage: savedForNewMode.endlessStage,
            endlessScore: savedForNewMode.endlessScore,
            chaosModifier: savedForNewMode.chaosModifier,
            customChallengeWord: savedForNewMode.customChallengeWord,
            savedGamesByMode: updatedSaved,
          });
          return;
        }

        // 3. Otherwise initialize a fresh game for this mode
        delete updatedSaved[mode];

        let length = options?.wordLength || 5;
        let guesses = options?.maxGuesses || 6;
        let timerMax = 60;
        let chaosMod: ChaosModifier | null = null;

        if (mode === 'timed') {
          timerMax = 60;
        } else if (mode === 'survival') {
          if (current.survivalLives <= 0) {
            set({ survivalLives: 3, survivalStreak: 0 });
          }
        } else if (mode === 'endless') {
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

        const currentLang = useSettingsStore.getState().gameLanguage;
        let target = '';
        if (options?.customTarget) {
          target = options.customTarget.toUpperCase();
        } else if (mode === 'daily') {
          target = getDailyWord(5, today).toUpperCase();
        } else {
          target = getRandomWord(length, currentLang);
        }

        // Daily: record the initial daily state as saved so it can be locked once completed
        if (mode === 'daily') {
          updatedSaved['daily'] = {
            targetWord: target,
            wordLength: 5,
            guesses: [],
            maxGuesses: guesses,
            currentGuess: '',
            status: 'playing',
            hints: [],
            hintsRemaining: 2,
            timerSeconds: 60,
            timerMaxSeconds: 60,
            elapsedSeconds: 0,
            survivalLives: 3,
            survivalMaxLives: 3,
            survivalStreak: 0,
            survivalBest: 0,
            endlessStage: 1,
            endlessScore: 0,
            chaosModifier: null,
            customChallengeWord: null,
            dailyDate: today,
            savedAt: Date.now(),
          };
        }

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
          hintsRemaining: 2,
          timerSeconds: timerMax,
          timerMaxSeconds: timerMax,
          timerRunning: mode === 'timed' || (mode === 'chaos' && chaosMod?.id === 'speed'),
          elapsedSeconds: 0,
          chaosModifier: chaosMod,
          customChallengeWord: options?.customTarget || null,
          savedGamesByMode: updatedSaved,
        });
      },

      resetGame: (newTarget, customMaxGuesses, customWordLength) => {
        const { gameMode, wordLength, maxGuesses, endlessStage, savedGamesByMode } = get();

        // Daily mode: never allow reset — the challenge is one attempt per day
        if (gameMode === 'daily') {
          const today = getDailyDateIST();
          const dailySaved = savedGamesByMode['daily'];
          if (dailySaved && dailySaved.dailyDate === today && dailySaved.status !== 'playing') {
            // Game already completed today — do nothing
            return;
          }
        }

        const updatedSaved = { ...savedGamesByMode };
        delete updatedSaved[gameMode];

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
          if (get().survivalLives <= 0) {
            set({ survivalLives: 3, survivalStreak: 0 });
          }
        }

        const currentLang = useSettingsStore.getState().gameLanguage;
        let target = '';
        if (newTarget) {
          target = newTarget.toUpperCase();
        } else {
          target = getRandomWord(targetLen, currentLang);
        }

        set({
          targetWord: target,
          wordLength: targetLen,
          guesses: [],
          currentGuess: '',
          status: 'playing',
          error: null,
          hints: [],
          hintsRemaining: 2,
          maxGuesses: allowedGuesses,
          timerSeconds: timerMax,
          timerMaxSeconds: timerMax,
          timerRunning: gameMode === 'timed' || (gameMode === 'chaos' && chaosMod?.id === 'speed'),
          elapsedSeconds: 0,
          chaosModifier: chaosMod,
          savedGamesByMode: updatedSaved,
        });
      },

      tickTimer: () => {
        const { timerSeconds, status, targetWord, gameMode, chaosModifier, elapsedSeconds } = get();
        if (status !== 'playing') return;

        const isTimedChallenge = gameMode === 'timed' || (gameMode === 'chaos' && chaosModifier?.id === 'speed');

        if (isTimedChallenge) {
          if (timerSeconds <= 1) {
            set({
              timerSeconds: 0,
              timerRunning: false,
              status: 'lost',
              error: `Time's up! The word was: ${targetWord}`,
              // Show the result modal fresh
              resultModalSeen: false,
            });
            usePlayerStore.getState().recordGameResult(false, get().guesses.length);
          } else {
            set({ timerSeconds: timerSeconds - 1 });
          }
        } else {
          // Standard modes with timer enabled just count elapsed time and never end the game
          set({ elapsedSeconds: (elapsedSeconds || 0) + 1 });
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
          hintsRemaining: 2,
          maxGuesses: 6,
          elapsedSeconds: 0,
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
          hintsRemaining: 2,
          elapsedSeconds: 0,
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
          hintsRemaining: 2,
          chaosModifier: chaosMod,
          timerSeconds: timerMax,
          timerMaxSeconds: timerMax,
          timerRunning: chaosMod.id === 'speed',
          elapsedSeconds: 0,
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
          hintsRemaining: 2,
          elapsedSeconds: 0,
        });
      },
      
      clearError: () => set({ error: null }),

      useHint: () => {
        const { targetWord, hints, status, hintsRemaining, guesses } = get();
        if (status !== 'playing') return;

        const lang = useSettingsStore.getState().interfaceLanguage;

        if (hintsRemaining <= 0) {
          set({ error: formatNoHintsLeft(lang) });
          return;
        }

        // Normalize existing hints in case of legacy string format
        const validHints = hints.filter(h => typeof h === 'object' && h !== null);
        const alreadyHintedIndices = new Set(validHints.map(h => h.index));

        // Find positions already correctly identified by past guesses
        const correctlyGuessedIndices = new Set<number>();
        for (const guess of guesses) {
          for (let i = 0; i < guess.length && i < targetWord.length; i++) {
            if (guess[i] === targetWord[i]) {
              correctlyGuessedIndices.add(i);
            }
          }
        }

        // Candidates: positions neither already hinted nor already guessed correctly
        const availableIndices: number[] = [];
        for (let i = 0; i < targetWord.length; i++) {
          if (!alreadyHintedIndices.has(i) && !correctlyGuessedIndices.has(i)) {
            availableIndices.push(i);
          }
        }

        // Fallback: any un-hinted position
        if (availableIndices.length === 0) {
          for (let i = 0; i < targetWord.length; i++) {
            if (!alreadyHintedIndices.has(i)) {
              availableIndices.push(i);
            }
          }
        }

        if (availableIndices.length === 0) {
          set({ error: formatAllRevealed(lang) });
          return;
        }

        // Pick one of the available positions
        const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const hintLetter = targetWord[chosenIndex];
        const remaining = hintsRemaining - 1;

        const newHint: PositionHint = {
          index: chosenIndex,
          letter: hintLetter,
        };

        const updatedHints = [...validHints, newHint];
        const currentMode = get().gameMode;
        const updatedSavedGames = { ...get().savedGamesByMode };
        if (updatedSavedGames[currentMode]) {
          updatedSavedGames[currentMode] = {
            ...updatedSavedGames[currentMode]!,
            hints: updatedHints,
            hintsRemaining: remaining,
          };
        }

        set({ 
          hints: updatedHints, 
          hintsRemaining: remaining,
          error: formatHintMessage(lang, chosenIndex + 1, hintLetter, remaining),
          savedGamesByMode: updatedSavedGames,
        });
      },

      dismissResultModal: () => set({ resultModalSeen: true }),
    }),
    {
      name: 'wordly-game-storage',
      partialize: (state) => {
        // Exclude resultModalSeen from storage — it must always start as false on page load
        const { resultModalSeen, dismissResultModal, ...rest } = state as any;
        return rest;
      },
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
