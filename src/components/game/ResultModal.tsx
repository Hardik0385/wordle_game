'use client';

import { useGameStore } from '@/store/game-store';
import { usePlayerStore } from '@/store/player-store';
import { evaluateGuess } from '@/engine/guess-evaluator';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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
    timerMaxSeconds
  } = useGameStore();
  const { stats } = usePlayerStore();

  if (status === 'playing') return null;

  const won = status === 'won';
  const isSurvival = gameMode === 'survival';
  const isEndless = gameMode === 'endless';
  const isTimed = gameMode === 'timed';
  const isChaos = gameMode === 'chaos';

  const xpGained = won ? 100 + ((maxGuesses - guesses.length) * 20) : 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#181c26] w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-[#262b39]">
        
        <div className="text-5xl mb-3">
          {won ? '🎉' : isSurvival && survivalLives > 0 ? '💔' : '💀'}
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          {won 
            ? isEndless 
              ? `Stage ${endlessStage} Cleared!` 
              : isSurvival 
              ? 'Streak +1!' 
              : 'Brilliant!' 
            : isSurvival && survivalLives > 0
              ? 'Heart Lost!'
              : 'Game Over'}
        </h2>
        
        <p className="text-[#8e95a5] mb-5 text-xs sm:text-sm">
          {won 
            ? `Solved in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''}${isTimed ? ` (${timerMaxSeconds - timerSeconds}s)` : ''}.` 
            : `The word was ${targetWord}.`}
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
              onClick={() => nextSurvivalWord()}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-colors shadow-lg shadow-orange-500/20"
            >
              {won ? 'Next Word (Keep Streak 🔥)' : `Next Word (${survivalLives} Lives Left ❤️)`}
            </button>
          ) : isEndless && won ? (
            <button 
              onClick={() => nextEndlessStage()}
              className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] text-black font-black text-sm transition-colors shadow-lg shadow-[#2ec47d]/20"
            >
              Advance to Stage {endlessStage + 1} 📈
            </button>
          ) : isChaos ? (
            <button 
              onClick={() => nextChaosWord()}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm transition-colors shadow-lg shadow-purple-600/20"
            >
              Next Chaos Challenge 🌪️
            </button>
          ) : (
            <button 
              onClick={() => resetGame()}
              className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] text-black font-black text-sm transition-colors shadow-lg shadow-[#2ec47d]/20"
            >
              {won ? 'Next Word' : 'Try Again'}
            </button>
          )}
          
          <div className="flex gap-2 w-full">
            <Link 
              href="/modes"
              className="flex-1 py-2.5 rounded-2xl bg-[#222735] hover:bg-[#2a3040] font-bold text-xs text-white transition-colors flex items-center justify-center border border-[#2e3547]"
            >
              Other Modes
            </Link>
            <button 
              onClick={async () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'midnight' || document.documentElement.classList.contains('dark');
                const absentEmoji = isDark ? '⬛' : '⬜';
                
                const grid = guesses.map(guess => {
                  return evaluateGuess(guess, targetWord)
                    .map(e => e.state === 'correct' ? '🟩' : e.state === 'present' ? '🟨' : absentEmoji)
                    .join('');
                }).join('\n');
                
                const modeTitle = gameMode.toUpperCase();
                const text = `WORDLY [${modeTitle}] ${guesses.length}/${maxGuesses}\n\n${grid}`;
                await navigator.clipboard.writeText(text);
                toast.success("Result copied to clipboard!");
              }}
              className="flex-1 py-2.5 rounded-2xl bg-[#222735] hover:bg-[#2a3040] font-bold text-xs text-blue-400 transition-colors flex items-center justify-center border border-[#2e3547]"
            >
              Share Result 🔗
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
