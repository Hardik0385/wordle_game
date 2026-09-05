'use client';

import Link from 'next/link';
import { usePlayerStore } from '@/store/player-store';
import { Play, Calendar, LayoutGrid, Award } from 'lucide-react';

export default function Home() {
  const { name, stats } = usePlayerStore();

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto select-none">
      
      <header className="w-full mb-10 mt-6 flex flex-col items-center text-center">
        <div className="h-20 w-20 bg-[#181c26] border border-[#262b39] rounded-full mb-4 flex items-center justify-center text-3xl shadow-inner">
          👋
        </div>
        <h1 className="text-3xl font-black text-white">Welcome back, {name}</h1>
        <p className="text-[#8e95a5] mt-1 text-sm font-semibold">
          Level {stats.level} • {stats.totalXP.toLocaleString()} XP
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
        <div className="bg-[#181c26] border border-[#262b39] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-white mb-0.5">{stats.currentStreak}</div>
          <div className="text-[10px] text-[#8e95a5] uppercase tracking-wider font-bold">Current Streak</div>
        </div>
        <div className="bg-[#181c26] border border-[#262b39] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-white mb-0.5">{stats.gamesPlayed}</div>
          <div className="text-[10px] text-[#8e95a5] uppercase tracking-wider font-bold">Total Games</div>
        </div>
        <div className="bg-[#181c26] border border-[#262b39] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-white mb-0.5">{winPercentage}%</div>
          <div className="text-[10px] text-[#8e95a5] uppercase tracking-wider font-bold">Win Rate</div>
        </div>
        <div className="bg-[#181c26] border border-[#262b39] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-[#2ec47d] mb-0.5">Available</div>
          <div className="text-[10px] text-[#8e95a5] uppercase tracking-wider font-bold">Daily Word</div>
        </div>
      </div>

      {/* Main Action Links */}
      <div className="w-full flex flex-col gap-3">
        <Link 
          href="/play" 
          className="w-full bg-[#2ec47d] hover:bg-[#28b371] text-black py-5 rounded-3xl flex items-center justify-center gap-3 text-lg font-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#2ec47d]/20"
        >
          <Play fill="currentColor" size={20} /> PLAY NOW
        </Link>
        
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/daily" 
            className="bg-[#181c26] hover:bg-[#222735] text-white border border-[#262b39] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm"
          >
            <Calendar size={18} className="text-[#2ec47d]" /> Daily Challenge
          </Link>
          <Link 
            href="/modes" 
            className="bg-[#181c26] hover:bg-[#222735] text-white border border-[#262b39] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm"
          >
            <LayoutGrid size={18} className="text-purple-400" /> Explore Modes
          </Link>
        </div>
      </div>

    </main>
  );
}
