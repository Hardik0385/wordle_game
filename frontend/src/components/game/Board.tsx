'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';
import { getTranslation } from '@/lib/translations';
import { Tile } from './Tile';
import { evaluateGuess } from '@/engine/guess-evaluator';
import { motion } from 'framer-motion';

export function Board() {
  const { 
    guesses, 
    currentGuess, 
    maxGuesses, 
    targetWord, 
    error, 
    clearError, 
    useHint, 
    forfeitGame,
    hintsRemaining,
    hints,
    status,
    gameMode,
    chaosModifier
  } = useGameStore();
  const { animationSpeed, interfaceLanguage } = useSettingsStore();
  const [shake, setShake] = useState(false);

  // Clamp hintsRemaining to 1 (fixes older cached local storage states that had 2 hints)
  useEffect(() => {
    if (hintsRemaining > 1) {
      useGameStore.setState({ hintsRemaining: 1 });
    }
  }, [hintsRemaining]);

  const isFog = gameMode === 'chaos' && chaosModifier?.id === 'fog';

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => {
        setShake(false);
        clearError();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const showCurrentRow = guesses.length < maxGuesses && status === 'playing';
  const empties = Math.max(0, maxGuesses - guesses.length - (showCurrentRow ? 1 : 0));

  return (
    <div className="flex flex-col items-center w-full">
      {/* Interactive Tile Grid */}
      <div className="flex flex-col gap-[min(0.25rem,1vh)] sm:gap-[min(0.375rem,1.2vh)] md:gap-[min(0.75rem,1.5vh)] relative mb-12">
        {/* Floating Error Toast Notification */}
        {error && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <span className="bg-[var(--surface)] text-[var(--foreground)] border border-[var(--surface-border)] px-4 py-2 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm text-center tracking-wide">
              {error}
            </span>
          </div>
        )}

        {guesses.map((guess, i) => {
          const evaluated = evaluateGuess(guess, targetWord);
          const isWinningRow = status === 'won' && i === guesses.length - 1;
          const winDuration = animationSpeed === 'off' ? 0 : animationSpeed === 'fast' ? 0.2 : 0.5;
          
          return (
            <div key={i} className="flex justify-center gap-[min(0.25rem,1vh)] sm:gap-[min(0.375rem,1.2vh)] md:gap-[min(0.75rem,1.5vh)]">
              {evaluated.map((e, j) => (
                <motion.div 
                  key={j}
                  initial={false}
                  animate={isWinningRow && animationSpeed !== 'off' ? { y: [0, -20, 0] } : {}}
                  transition={isWinningRow ? { duration: winDuration, delay: animationSpeed === 'fast' ? j * 0.04 : j * 0.1, ease: "easeInOut" } : {}}
                >
                  <Tile letter={e.letter} state={e.state} fogged={isFog && i < guesses.length - 1} />
                </motion.div>
              ))}
            </div>
          );
        })}

        {showCurrentRow && (
          <motion.div 
            className="flex gap-1 sm:gap-1.5 md:gap-3 justify-center"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {Array(targetWord.length).fill(null).map((_, i) => {
              const hintAtPos = hints.find(h => typeof h === 'object' && h !== null && h.index === i);
              const hasTyped = !!currentGuess[i];
              const displayLetter = currentGuess[i] || (hintAtPos ? hintAtPos.letter : undefined);
              const isHint = !hasTyped && !!hintAtPos;

              return (
                <Tile
                  key={i}
                  letter={displayLetter}
                  isHint={isHint}
                  isCurrent={true}
                />
              );
            })}
          </motion.div>
        )}

        {Array(empties).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="flex gap-1 sm:gap-1.5 md:gap-3 justify-center">
            {Array(targetWord.length).fill(null).map((_, j) => (
              <Tile key={j} />
            ))}
          </div>
        ))}
      </div>

      {/* Floating Free Hint Capsule & Position Badges */}
      <div className="w-full max-w-[20rem] flex items-center justify-between gap-1.5 mt-1 sm:mt-2.5 md:mb-6">
        <div className="flex items-center gap-1 flex-wrap">
          {hints.map((h, idx) => (
            <span 
              key={idx} 
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-300 font-extrabold text-[10px] sm:text-[11px] shadow-sm animate-in fade-in zoom-in-95 duration-200"
            >
              <span>💡 Pos {h.index + 1}:</span>
              <span className="text-[11px] sm:text-xs uppercase underline underline-offset-2">{h.letter}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {gameMode !== 'daily' && (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                (e.currentTarget as HTMLButtonElement)?.blur();
                forfeitGame();
              }}
              disabled={status !== 'playing'}
              className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black bg-[var(--surface)] hover:bg-red-500/10 text-[var(--foreground)] hover:text-red-500 border border-[var(--surface-border)] hover:border-red-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none"
            >
              <span className="text-xs sm:text-sm">🏳️</span>
              <span>Give Up</span>
            </button>
          )}

          <button 
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement)?.blur();
              useHint();
            }}
            disabled={hintsRemaining <= 0 || status !== 'playing'}
            className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black bg-[var(--surface)] hover:bg-[var(--surface-border)] text-[var(--foreground)] border border-[var(--surface-border)] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none"
          >
            <span className="text-yellow-400 text-xs sm:text-sm">💡</span>
            <span>{getTranslation(interfaceLanguage, 'hint')}</span>
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-yellow-400/20 text-yellow-600 dark:text-yellow-300">
              {hintsRemaining} {getTranslation(interfaceLanguage, 'free')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
