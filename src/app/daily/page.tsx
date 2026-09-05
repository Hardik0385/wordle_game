'use client';

import { useEffect, useState } from 'react';
import { Board } from '@/components/game/Board';
import { Keyboard } from '@/components/game/Keyboard';
import { ResultModal } from '@/components/game/ResultModal';
import { useGameStore } from '@/store/game-store';
import { getDailyWord } from '@/engine/word-validator';

export default function DailyPage() {
  const { setGameMode, gameMode } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (gameMode !== 'daily') {
      setGameMode('daily');
    }
    setMounted(true);
  }, [setGameMode, gameMode]);

  if (!mounted) return <div className="p-8">Loading daily challenge...</div>;

  return (
    <main className="flex h-[100dvh] max-h-[100dvh] flex-col items-center justify-between p-2 sm:p-4 md:p-6 pb-[4.25rem] md:pb-4 overflow-hidden select-none">
      <ResultModal />
      <header className="w-full max-w-lg mb-1 sm:mb-2.5 flex justify-between items-center py-1 sm:py-2 border-b dark:border-gray-800 shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-widest text-center flex-1">DAILY CHALLENGE</h1>
      </header>
      
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg min-h-0">
        <Board />
      </div>
      
      <div className="w-full max-w-lg shrink-0">
        <Keyboard />
      </div>
    </main>
  );
}
