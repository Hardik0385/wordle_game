'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { usePlayerStore } from '@/store/player-store';
import { useSettingsStore } from '@/store/settings-store';
import { getTranslation } from '@/lib/translations';
import Link from 'next/link';

export function ResultModal() {
  const {
    status,
    targetWord,
    guesses,
    maxGuesses,
    resetGame,
    gameMode,
    survivalLives,
    survivalStreak,
    nextSurvivalWord,
    endlessStage,
    endlessScore,
    nextEndlessStage,
    nextChaosWord,
    timerSeconds,
    timerMaxSeconds,
    resultModalSeen,
    dismissResultModal,
  } = useGameStore();
  const { stats } = usePlayerStore();
  const interfaceLanguage = useSettingsStore(state => state.interfaceLanguage);

  // Auto-dismiss modal when navigating away (component unmounts then remounts,
  // but resultModalSeen is NOT persisted so it always resets to false on page reload).
  // We dismiss on Escape key too.
  useEffect(() => {
    if (status === 'playing' || resultModalSeen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissResultModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, resultModalSeen, dismissResultModal]);

  // Don't render if game is ongoing OR if the user has already seen/dismissed the modal
  if (status === 'playing' || resultModalSeen) return null;

  const won = status === 'won';
  const isSurvival = gameMode === 'survival';
  const isEndless = gameMode === 'endless';
  const isTimed = gameMode === 'timed';
  const isChaos = gameMode === 'chaos';
  const isDaily = gameMode === 'daily';

  const xpGained = won ? (isDaily ? 150 : 100) + ((maxGuesses - guesses.length) * 20) : 10;

  const handleNextWord = () => {
    dismissResultModal();
    resetGame();
  };

  const handleNextSurvival = () => {
    dismissResultModal();
    nextSurvivalWord();
  };

  const handleNextEndless = () => {
    dismissResultModal();
    nextEndlessStage();
  };

  const handleNextChaos = () => {
    dismissResultModal();
    nextChaosWord();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[var(--surface)] w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-[var(--surface-border)]">

        <div className="text-5xl mb-3">
          {won ? '🎉' : isSurvival && survivalLives > 0 ? '💔' : '💀'}
        </div>

        <h2 className="text-2xl font-black text-[var(--foreground)] mb-1">
          {won
            ? isEndless
              ? `Stage ${endlessStage} Cleared!`
              : isSurvival
                ? 'Streak +1!'
                : getTranslation(interfaceLanguage, 'congratulations')
            : isSurvival && survivalLives > 0
              ? 'Heart Lost!'
              : getTranslation(interfaceLanguage, 'game_over')}
        </h2>

        <p className="text-[var(--foreground-muted)] mb-5 text-xs sm:text-sm">
          {won
            ? `You guessed the word in ${guesses.length} attempts.`
            : `${getTranslation(interfaceLanguage, 'the_word_was')} ${targetWord}.`}
        </p>

        {/* Stats Showcase */}
        <div className="w-full bg-[#12151c] rounded-2xl p-4 flex justify-around mb-5 border border-[#222735]">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-[#2ec47d]">+{xpGained}</span>
            <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">XP Gained</span>
          </div>

          {isSurvival ? (
            <>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-orange-400">{survivalStreak}</span>
                <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-red-400">{survivalLives} ❤️</span>
                <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">Lives Left</span>
              </div>
            </>
          ) : isEndless ? (
            <>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-blue-400">Stage {endlessStage}</span>
                <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">Tier</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-amber-400">{endlessScore.toLocaleString()}</span>
                <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">Score</span>
              </div>
            </>
          ) : isDaily ? (
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-orange-400">🔥 {stats.dailyStreak}</span>
              <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">Daily Streak</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-white">{stats.currentStreak}</span>
              <span className="text-[10px] text-[#8e95a5] uppercase font-bold tracking-wider">Streak</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Primary mode advancement button */}
          {isSurvival && (won || survivalLives > 0) ? (
            <button
              onClick={handleNextSurvival}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-colors shadow-lg shadow-orange-500/20"
            >
              {won ? 'Next Word (Keep Streak 🔥)' : `Next Word (${survivalLives} Lives Left ❤️)`}
            </button>
          ) : isEndless && won ? (
            <button
              onClick={handleNextEndless}
              className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] text-black font-black text-sm transition-colors shadow-lg shadow-[#2ec47d]/20"
            >
              Advance to Stage {endlessStage + 1} 📈
            </button>
          ) : isChaos ? (
            <button
              onClick={handleNextChaos}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm transition-colors shadow-lg shadow-purple-600/20"
            >
              Next Chaos Challenge 🌪️
            </button>
          ) : isDaily ? (
            // Daily: no replay button — just dismiss to see the board/result
            <button
              onClick={dismissResultModal}
              className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] text-black font-black text-sm transition-colors shadow-lg shadow-[#2ec47d]/20"
            >
              See Result Board
            </button>
          ) : (
            <button
              onClick={handleNextWord}
              className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] text-black font-black text-sm transition-colors shadow-lg shadow-[#2ec47d]/20"
            >
              {won ? getTranslation(interfaceLanguage, 'next_word') : getTranslation(interfaceLanguage, 'try_again')}
            </button>
          )}

          <div className="flex gap-2 w-full">
            <Link
              href="/modes"
              onClick={dismissResultModal}
              className="flex-1 py-2.5 rounded-2xl bg-[var(--background)] hover:bg-[var(--surface-border)] font-bold text-xs text-[var(--foreground)] transition-colors flex items-center justify-center border border-[var(--surface-border)]"
            >
              {getTranslation(interfaceLanguage, 'other_modes')}
            </Link>
            <Link
              href="/stats"
              onClick={dismissResultModal}
              className="flex-1 py-2.5 rounded-2xl bg-[var(--background)] hover:bg-[var(--surface-border)] font-bold text-xs text-[var(--foreground)] transition-colors flex items-center justify-center border border-[var(--surface-border)]"
            >
              {getTranslation(interfaceLanguage, 'stats')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
