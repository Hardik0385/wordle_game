'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/game-store';
import { evaluateGuess, LetterState } from '@/engine/guess-evaluator';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

import { useSettingsStore } from '@/store/settings-store';
import { sounds } from '@/lib/sound';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export function Keyboard() {
  const { addLetter, removeLetter, submitGuess, guesses, targetWord, hints } = useGameStore();
  const colorblindMode = useSettingsStore(state => state.colorblindMode);

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

  // Any revealed position hint letter is by definition 'correct' in the target word
  hints.forEach(h => {
    if (h && typeof h === 'object' && h.letter) {
      letterStates.set(h.letter, 'correct');
    }
  });

  const handleKey = useCallback((key: string) => {
    const { soundEnabled, hapticsEnabled } = useSettingsStore.getState();
    if (soundEnabled) {
      sounds.playKeyClick();
    }
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }

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
        e.preventDefault();
        e.stopPropagation();
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        handleKey('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  return (
    <div className="flex w-full flex-col gap-[min(0.25rem,1vh)] sm:gap-[min(0.375rem,1.2vh)] md:gap-[min(0.6rem,1.5vh)] max-w-lg md:max-w-[600px] mx-auto select-none">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-[min(0.25rem,1vh)] sm:gap-[min(0.375rem,1.2vh)] md:gap-[min(0.5rem,1.2vh)] w-full">
          {row.map(key => {
            const state = letterStates.get(key);
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            
            return (
              <button
                key={key}
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  (e.currentTarget as HTMLButtonElement)?.blur();
                  handleKey(key);
                }}
                className={cn(
                  "relative flex items-center justify-center rounded-lg sm:rounded-xl font-black uppercase transition-all h-[min(3.2rem,5.5vh)] sm:h-[min(3.5rem,6vh)] md:h-[min(3.6rem,6.5vh)] text-xs min-[360px]:text-sm sm:text-base flex-1 shadow-sm active:scale-95 outline-none focus:outline-none",
                  {
                    "max-w-[min(3.8rem,6.5vh)] min-[360px]:max-w-[min(4.2rem,7vh)] sm:max-w-[min(4.5rem,7.5vh)] md:max-w-[min(4.8rem,8vh)] px-0.5 min-[360px]:px-1 text-[9px] min-[360px]:text-[10px] sm:text-xs tracking-tight sm:tracking-wider": isSpecial,
                    "max-w-[min(2.6rem,4.5vh)] sm:max-w-[min(2.8rem,5vh)] md:max-w-[min(3rem,5.5vh)]": !isSpecial,
                    "bg-[var(--key-bg)] hover:brightness-110 text-[var(--key-text)]": !state,
                    "bg-[var(--tile-bg-absent)] text-[var(--tile-text-absent)] opacity-60": state === 'absent',
                    "bg-[#0284c7] text-white shadow-md": state === 'present' && colorblindMode,
                    "bg-[var(--tile-bg-present)] text-[var(--tile-text-present)] shadow-md": state === 'present' && !colorblindMode,
                    "bg-[#f97316] text-white shadow-md": state === 'correct' && colorblindMode,
                    "bg-[var(--tile-bg-correct)] text-[var(--tile-text-correct)] shadow-md": state === 'correct' && !colorblindMode,
                  }
                )}
              >
                {key === 'BACKSPACE' ? <Delete size={16} className="sm:w-[18px] sm:h-[18px]" /> : key}
                {colorblindMode && state === 'correct' && (
                  <span className="absolute top-0.5 right-1 text-[7px] font-black text-white/90 leading-none select-none">✓</span>
                )}
                {colorblindMode && state === 'present' && (
                  <span className="absolute top-0.5 right-1 text-[6px] font-black text-white/90 leading-none select-none">●</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
