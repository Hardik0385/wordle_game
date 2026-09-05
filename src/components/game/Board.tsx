'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { Tile } from './Tile';
import { evaluateGuess } from '@/engine/guess-evaluator';
import { Lightbulb } from 'lucide-react';
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
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const empties = Math.max(0, maxGuesses - guesses.length - (currentGuess ? 1 : 0));

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-[20rem] flex justify-end">
        <button 
          onClick={useHint}
          className="flex items-center gap-1 text-sm font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full hover:scale-105 transition-transform"
        >
          <Lightbulb size={16} /> Hint (50 XP)
        </button>
      </div>

      <div className="flex flex-col gap-2 relative">
        {error && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center z-10 animate-in fade-in slide-in-from-top-2">
            <span className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded shadow-lg font-bold text-center">
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

      {guesses.length < maxGuesses && status !== 'won' && (
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
        <div key={i + guesses.length + 1} className="flex gap-2 justify-center">
          {Array(targetWord.length).fill(null).map((_, j) => (
            <Tile key={j} />
          ))}
        </div>
      ))}
      </div>
    </div>
  );
}
