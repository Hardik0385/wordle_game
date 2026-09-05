'use client';

import { useEffect, useState } from 'react';
import { Board } from '@/components/game/Board';
import { Keyboard } from '@/components/game/Keyboard';
import { ResultModal } from '@/components/game/ResultModal';
import { useGameStore } from '@/store/game-store';
import { getDailyWord } from '@/engine/word-validator';

export default function DailyPage() {
  const { resetGame, targetWord } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Generate today's date string, e.g. "2026-09-06"
    const today = new Date().toISOString().split('T')[0];
    const dailyWord = getDailyWord(5, today);

    // If the current target word is not the daily word, reset the game for the daily challenge
    if (targetWord !== dailyWord.toUpperCase()) {
      resetGame(dailyWord);
    }
    setMounted(true);
  }, [resetGame, targetWord]);

  if (!mounted) return <div className="p-8">Loading daily challenge...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8">
      <ResultModal />
      <header className="w-full max-w-lg mb-8 flex justify-between items-center py-4 border-b dark:border-gray-800">
        <h1 className="text-xl font-extrabold tracking-widest text-center flex-1">DAILY CHALLENGE</h1>
      </header>
      
      <div className="flex-1 flex flex-col justify-center w-full max-w-lg mb-8">
        <Board />
      </div>
      
      <div className="w-full max-w-lg">
        <Keyboard />
      </div>
    </main>
  );
}
