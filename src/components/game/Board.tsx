'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game-store';
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
    hintsRemaining,
    status,
    gameMode,
    chaosModifier
  } = useGameStore();
  const [shake, setShake] = useState(false);

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
      <div className="flex flex-col gap-2 relative">
        {/* Floating Error Toast Notification */}
        {error && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <span className="bg-[#1f2433] text-white border border-[#323a4f] px-4 py-2 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm text-center tracking-wide">
              {error}
            </span>
          </div>
        )}

        {guesses.map((guess, i) => {
          const evaluated = evaluateGuess(guess, targetWord);
          const isWinningRow = status === 'won' && i === guesses.length - 1;
          
          return (
            <div key={i} className="flex gap-2 justify-center">
              {evaluated.map((e, j) => (
                <motion.div 
                  key={j}
                  initial={false}
                  animate={isWinningRow ? { y: [0, -20, 0] } : {}}
                  transition={isWinningRow ? { duration: 0.5, delay: j * 0.1, ease: "easeInOut" } : {}}
                >
                  <Tile letter={e.letter} state={e.state} fogged={isFog && i < guesses.length - 1} />
                </motion.div>
              ))}
            </div>
          );
        })}

        {showCurrentRow && (
          <motion.div 
            className="flex gap-2 justify-center"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {Array(targetWord.length).fill(null).map((_, i) => (
              <Tile
                key={i}
                letter={currentGuess[i]}
                isCurrent={true}
              />
            ))}
          </motion.div>
        )}

        {Array(empties).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="flex gap-2 justify-center">
            {Array(targetWord.length).fill(null).map((_, j) => (
              <Tile key={j} />
            ))}
          </div>
        ))}
      </div>

      {/* Floating Free Hint Capsule - positioned matching Image 3 */}
      <div className="w-full max-w-[20rem] flex justify-end mt-4">
        <button 
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            (e.currentTarget as HTMLButtonElement)?.blur();
            useHint();
          }}
          disabled={hintsRemaining <= 0 || status !== 'playing'}
          className="flex items-center gap-1.5 text-xs font-black bg-[#1a1f2b] hover:bg-[#242b3c] text-white border border-[#2b3346] px-4 py-2 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none"
        >
          <span className="text-yellow-400 text-sm">💡</span>
          <span>Hint</span>
          <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-400/20 text-yellow-300">
            {hintsRemaining} free
          </span>
        </button>
      </div>
    </div>
  );
}
