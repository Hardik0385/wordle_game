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
    survivalBest, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
        
        <div className="text-5xl mb-3">
          {won ? '🎉' : isSurvival && survivalLives > 0 ? '💔' : '💀'}
        </div>

        <h2 className="text-2xl font-black mb-1">
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
        
        <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
          {won 
            ? `Solved in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''}${isTimed ? ` (${timerMaxSeconds - timerSeconds}s)` : ''}.` 
            : `The word was ${targetWord}.`}
        </p>

        {/* Stats Showcase */}
        <div className="w-full bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 flex justify-around mb-5 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-green-500">+{xpGained}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">XP Gained</span>
          </div>

          {isSurvival ? (
            <>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-orange-500">{survivalStreak}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black">{survivalLives} ❤️</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Lives Left</span>
              </div>
            </>
          ) : isEndless ? (
            <>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-blue-500">Stage {endlessStage}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tier</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-amber-500">{endlessScore.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Score</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{stats.currentStreak}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Streak</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Primary mode advancement button */}
          {isSurvival && (won || survivalLives > 0) ? (
            <button 
              onClick={() => nextSurvivalWord()}
              className="w-full py-3.5 rounded-xl bg-orange-600 text-white font-black text-base hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
            >
              {won ? 'Next Word (Keep Streak 🔥)' : `Next Word (${survivalLives} Lives Left ❤️)`}
            </button>
          ) : isEndless && won ? (
            <button 
              onClick={() => nextEndlessStage()}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Advance to Stage {endlessStage + 1} 📈
            </button>
          ) : isChaos ? (
            <button 
              onClick={() => nextChaosWord()}
              className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-black text-base hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
            >
              Next Chaos Challenge 🌪️
            </button>
          ) : (
            <button 
              onClick={() => resetGame()}
              className="w-full py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-base hover:opacity-90 transition-opacity"
            >
              {won ? 'Next Word' : 'Try Again'}
            </button>
          )}
          
          <div className="flex gap-2 w-full">
            <Link 
              href="/modes"
              className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
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
              className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400 flex items-center justify-center"
            >
              Share Result 🔗
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
