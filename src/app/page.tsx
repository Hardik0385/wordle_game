'use client';

import Link from 'next/link';
import { usePlayerStore } from '@/store/player-store';
import { useSettingsStore } from '@/store/settings-store';
import { getTranslation } from '@/lib/translations';
import { Play, Calendar, LayoutGrid } from 'lucide-react';

export default function Home() {
  const { name, stats } = usePlayerStore();
  const interfaceLanguage = useSettingsStore(state => state.interfaceLanguage);

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto select-none">
      
      <header className="w-full mb-10 mt-6 flex flex-col items-center text-center">
        <div className="h-20 w-20 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full mb-4 flex items-center justify-center text-3xl shadow-inner">
          👋
        </div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'welcome_back')}, {name}</h1>
        <p className="text-[var(--foreground-muted)] mt-1 text-sm font-semibold">
          Level {stats.level} • {stats.totalXP.toLocaleString()} XP
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-[var(--foreground)] mb-0.5">{stats.currentStreak}</div>
          <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-bold">{getTranslation(interfaceLanguage, 'streak')}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-[var(--foreground)] mb-0.5">{stats.gamesPlayed}</div>
          <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-bold">{getTranslation(interfaceLanguage, 'played')}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-[var(--foreground)] mb-0.5">{winPercentage}%</div>
          <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-bold">{getTranslation(interfaceLanguage, 'win_rate')}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-4 rounded-3xl flex flex-col items-center text-center shadow-sm">
          <div className="text-2xl font-black text-[#2ec47d] mb-0.5">Available</div>
          <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-bold">{getTranslation(interfaceLanguage, 'daily')}</div>
        </div>
      </div>

      {/* Main Action Links */}
      <div className="w-full flex flex-col gap-3">
        <Link 
          href="/play" 
          className="w-full bg-[#2ec47d] hover:bg-[#28b371] text-black py-5 rounded-3xl flex items-center justify-center gap-3 text-lg font-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#2ec47d]/20"
        >
          <Play fill="currentColor" size={20} /> {getTranslation(interfaceLanguage, 'play').toUpperCase()}
        </Link>
        
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/daily" 
            className="bg-[var(--surface)] hover:bg-[var(--surface-border)] text-[var(--foreground)] border border-[var(--surface-border)] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm"
          >
            <Calendar size={18} className="text-[#2ec47d]" /> {getTranslation(interfaceLanguage, 'daily_challenge')}
          </Link>
          <Link 
            href="/modes" 
            className="bg-[var(--surface)] hover:bg-[var(--surface-border)] text-[var(--foreground)] border border-[var(--surface-border)] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm"
          >
            <LayoutGrid size={18} className="text-purple-400" /> {getTranslation(interfaceLanguage, 'game_modes')}
          </Link>
        </div>
      </div>

    </main>
  );
}
