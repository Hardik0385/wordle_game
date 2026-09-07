'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Board } from '@/components/game/Board';
import { Keyboard } from '@/components/game/Keyboard';
import { ResultModal } from '@/components/game/ResultModal';
import { ModeHeader } from '@/components/game/ModeHeader';
import { CustomGameModal } from '@/components/game/CustomGameModal';
import { useGameStore, GameMode } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';
import { toast } from 'react-hot-toast';

function PlayContent() {
  const searchParams = useSearchParams();
  const { 
    gameMode, 
    setGameMode, 
    status, 
    timerRunning, 
    tickTimer, 
    resetGame,
    forfeitTimedGameIfActive
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Synchronize mode from URL search parameters on load
  useEffect(() => {
    const modeParam = searchParams.get('mode') as GameMode | null;
    const challengeParam = searchParams.get('challenge');
    const lenParam = searchParams.get('len');
    const guessesParam = searchParams.get('g');

    if (challengeParam) {
      try {
        const decodedWord = atob(challengeParam).toUpperCase();
        const length = lenParam ? parseInt(lenParam, 10) : decodedWord.length;
        const maxGuesses = guessesParam ? parseInt(guessesParam, 10) : 6;

        setGameMode('custom', {
          customTarget: decodedWord,
          wordLength: length,
          maxGuesses: maxGuesses,
        });
        toast.success(`Challenged to solve a ${length}-letter mystery word! 🧩`);
      } catch (err) {
        console.error('Failed to decode challenge:', err);
      }
    } else if (modeParam && modeParam !== gameMode) {
      setGameMode(modeParam);
    }

    setMounted(true);
  }, [searchParams, gameMode, setGameMode]);

  // Forfeit active timed challenge if user navigates away or hides page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        forfeitTimedGameIfActive();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      forfeitTimedGameIfActive();
    };
  }, [forfeitTimedGameIfActive]);

  const showTimerSetting = useSettingsStore(state => state.showTimer);

  // Timed Mode, Chaos Speed, or Show Timer setting ticker effect
  useEffect(() => {
    if ((!timerRunning && !showTimerSetting) || status !== 'playing') return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, showTimerSetting, status, tickTimer]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-sm font-bold text-gray-500">
        Loading game mode...
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-between p-2 sm:p-4 md:p-6 pb-[4.25rem] md:pb-4 select-none">
      <ResultModal />
      <CustomGameModal 
        isOpen={customModalOpen} 
        onClose={() => setCustomModalOpen(false)} 
      />

      <ModeHeader onOpenCustomModal={() => setCustomModalOpen(true)} />
      
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg md:max-w-[600px]">
        <Board />
      </div>
      
      <div className="w-full max-w-lg md:max-w-[600px] shrink-0">
        <Keyboard />
      </div>
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-bold text-gray-500">Loading game...</div>}>
      <PlayContent />
    </Suspense>
  );
}
