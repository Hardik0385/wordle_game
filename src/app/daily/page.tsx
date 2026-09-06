'use client';

import { useEffect, useState } from 'react';
import { Board } from '@/components/game/Board';
import { Keyboard } from '@/components/game/Keyboard';
import { ResultModal } from '@/components/game/ResultModal';
import { useGameStore, getDailyDateIST } from '@/store/game-store';
import { usePlayerStore } from '@/store/player-store';
import Link from 'next/link';

export default function DailyPage() {
  const { setGameMode, gameMode, status, savedGamesByMode } = useGameStore();
  const { stats } = usePlayerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (gameMode !== 'daily') {
      setGameMode('daily');
    }
    setMounted(true);
  }, [setGameMode, gameMode]);

  if (!mounted) return <div className="p-8 text-center text-[var(--foreground-muted)]">Loading daily challenge...</div>;

  // Check if today's daily is already completed
  const today = getDailyDateIST();
  const dailySaved = savedGamesByMode['daily'];
  const alreadyCompleted = dailySaved && dailySaved.dailyDate === today && dailySaved.status !== 'playing';
  const wonToday = alreadyCompleted && dailySaved.status === 'won';

  // Next refresh time: midnight UTC = 5:30 AM IST
  // Use pure UTC arithmetic to avoid timezone double-counting bugs
  const now = new Date();
  const nextMidnightUTC = new Date(now);
  nextMidnightUTC.setUTCDate(nextMidnightUTC.getUTCDate() + 1);
  nextMidnightUTC.setUTCHours(0, 0, 0, 0);
  const msUntilRefresh = nextMidnightUTC.getTime() - now.getTime();
  const hoursLeft = Math.floor(msUntilRefresh / (1000 * 60 * 60));
  const minsLeft = Math.floor((msUntilRefresh % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <main className="flex h-[100dvh] max-h-[100dvh] flex-col items-center justify-between p-2 sm:p-4 md:p-6 pb-[4.25rem] md:pb-4 overflow-hidden select-none">
      <ResultModal />

      <header className="w-full max-w-lg mb-1 sm:mb-2.5 flex flex-col items-center gap-0.5 py-1 sm:py-2 border-b border-[var(--surface-border)] shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-widest text-center text-[var(--foreground)]">DAILY CHALLENGE</h1>
        <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">
          {today} — refreshes daily at 5:30 AM IST
        </p>
        {stats.dailyStreak > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-black text-orange-400">🔥 {stats.dailyStreak} day streak</span>
            {stats.dailyBestStreak > stats.dailyStreak && (
              <span className="text-[10px] text-[var(--foreground-muted)]">(best: {stats.dailyBestStreak})</span>
            )}
          </div>
        )}
      </header>

      {alreadyCompleted && status !== 'playing' ? (
        // Show "already played" screen — keyboard disabled but board visible
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg gap-5 px-4">
          <div className="text-5xl">{wonToday ? '🏆' : '💀'}</div>
          <div className="text-center">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-1">
              {wonToday ? "You solved today's puzzle!" : "You didn't get today's word."}
            </h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              {wonToday
                ? `Solved in ${dailySaved.guesses.length}/${dailySaved.maxGuesses} guesses`
                : `The word was: ${dailySaved.targetWord}`}
            </p>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-border)] px-8 py-4 flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-orange-400">🔥 {stats.dailyStreak}</span>
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold tracking-wider mt-0.5">Daily Streak</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#2ec47d]">{stats.dailyBestStreak}</span>
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold tracking-wider mt-0.5">Best Streak</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-[var(--foreground-muted)] font-bold">Next challenge in</p>
            <p className="text-lg font-black text-[#2ec47d] font-mono">{hoursLeft}h {minsLeft}m</p>
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <Link
              href="/modes"
              className="flex-1 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] font-bold text-sm text-[var(--foreground)] flex items-center justify-center transition-colors hover:bg-[var(--surface-border)]"
            >
              Other Modes
            </Link>
            <Link
              href="/stats"
              className="flex-1 py-3 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] font-black text-sm text-black flex items-center justify-center transition-colors"
            >
              View Stats
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg min-h-0">
            <Board />
          </div>

          <div className="w-full max-w-lg shrink-0">
            <Keyboard />
          </div>
        </>
      )}
    </main>
  );
}
