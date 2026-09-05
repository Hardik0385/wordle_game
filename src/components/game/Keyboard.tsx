'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/game-store';
import { evaluateGuess, LetterState } from '@/engine/guess-evaluator';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export function Keyboard() {
  const { addLetter, removeLetter, submitGuess, guesses, targetWord } = useGameStore();

  // Determine keyboard letter states based on past guesses
  const letterStates = new Map<string, LetterState>();
  
  guesses.forEach(guess => {
    const evaluated = evaluateGuess(guess, targetWord);
    evaluated.forEach(e => {
      const existingState = letterStates.get(e.letter);
      // Priority: correct > present > absent > unknown
      if (e.state === 'correct') {
        letterStates.set(e.letter, 'correct');
      } else if (e.state === 'present' && existingState !== 'correct') {
        letterStates.set(e.letter, 'present');
      } else if (e.state === 'absent' && existingState !== 'correct' && existingState !== 'present') {
        letterStates.set(e.letter, 'absent');
      }
    });
  });

  const handleKey = useCallback((key: string) => {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else if (/^[A-Z]$/.test(key)) {
      addLetter(key);
    }
  }, [addLetter, removeLetter, submitGuess]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      if (e.key === 'Enter') {
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        handleKey('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  return (
    <div className="flex w-full flex-col gap-2 max-w-lg mx-auto">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 sm:gap-2 w-full">
          {row.map(key => {
            const state = letterStates.get(key);
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            
            return (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className={cn(
                  "flex items-center justify-center rounded font-bold uppercase transition-colors h-14 sm:h-16 flex-1 max-w-[2.5rem] sm:max-w-[3rem]",
                  {
                    "max-w-[4rem] sm:max-w-[5rem] px-2 text-xs sm:text-sm": isSpecial,
                    "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white": !state && !isSpecial,
                    "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white": !state && isSpecial,
                    "bg-gray-400 dark:bg-gray-800 text-white": state === 'absent',
                    "bg-yellow-500 text-white": state === 'present',
                    "bg-green-500 text-white": state === 'correct',
                  }
                )}
              >
                {key === 'BACKSPACE' ? <Delete size={20} /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
