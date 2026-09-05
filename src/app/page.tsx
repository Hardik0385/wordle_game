'use client';

import Link from 'next/link';
import { usePlayerStore } from '@/store/player-store';
import { Play, Calendar, Zap, LayoutGrid } from 'lucide-react';

export default function Home() {
  const { name, stats } = usePlayerStore();

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto">
      
      <header className="w-full mb-12 mt-8 flex flex-col items-center text-center">
        <div className="h-24 w-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 flex items-center justify-center text-4xl shadow-inner">
          👋
        </div>
        <h1 className="text-3xl font-extrabold">Welcome back, {name}</h1>
        <p className="text-gray-500 mt-2">Level {stats.level} • {stats.totalXP.toLocaleString()} XP</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <div className="text-2xl font-bold mb-1">{stats.currentStreak}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Current Streak</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <div className="text-2xl font-bold mb-1">{stats.gamesPlayed}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total Games</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <div className="text-2xl font-bold mb-1">{winPercentage}%</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Win Rate</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <div className="text-2xl font-bold mb-1 text-green-500 dark:text-green-400">Available</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Daily Word</div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <Link href="/play" className="w-full bg-black text-white dark:bg-white dark:text-black py-6 rounded-3xl flex items-center justify-center gap-3 text-xl font-extrabold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl">
          <Play fill="currentColor" /> PLAY NOW
        </Link>
        
        <div className="grid grid-cols-2 gap-4">
          <Link href="/daily" className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:scale-[1.02] transition-transform">
            <Calendar size={18} /> Daily Challenge
          </Link>
          <Link href="/modes" className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:scale-[1.02] transition-transform">
            <LayoutGrid size={18} /> Explore Modes
          </Link>
        </div>
      </div>

    </main>
  );
}
