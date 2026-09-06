'use client';

import Link from 'next/link';
import { usePlayerStore } from '@/store/player-store';
import { useSettingsStore } from '@/store/settings-store';
import { useAuth } from '@/context/AuthContext';
import { getTranslation } from '@/lib/translations';
import { getDefaultAvatar } from '@/lib/avatars';
import { Play, Calendar, LayoutGrid, Swords, Trophy, Lock } from 'lucide-react';

export default function Home() {
  const { stats } = usePlayerStore();
  const { user, profile, signInWithGoogle } = useAuth();
  const interfaceLanguage = useSettingsStore(state => state.interfaceLanguage);

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  const displayName = profile?.displayName || user?.displayName || 'Player';
  const avatarUrl = profile?.photoURL || user?.photoURL || (user ? getDefaultAvatar(user.uid) : null);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto select-none">
      
      {/* Profile / Greeting Header */}
      <header className="w-full mb-8 mt-4 flex flex-col items-center text-center">
        {user ? (
          <>
            <div className="relative mb-3">
              <img
                src={avatarUrl!}
                alt={displayName}
                className="w-20 h-20 rounded-full border-3 border-[#2ec47d] object-cover shadow-lg bg-[var(--surface)]"
              />
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#2ec47d] text-white text-[10px] font-black uppercase tracking-wider shadow">
                {profile?.rating ?? 1200} ELO
              </div>
            </div>
            <h1 className="text-3xl font-black text-[var(--foreground)]">
              {getTranslation(interfaceLanguage, 'welcome_back')}, {displayName}
            </h1>
            <p className="text-[var(--foreground-muted)] mt-1 text-sm font-semibold">
              Level {stats.level} • {stats.totalXP.toLocaleString()} XP • {profile?.bio || 'Wordle Enthusiast'}
            </p>
          </>
        ) : (
          <>
            <div className="h-20 w-20 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full mb-3 flex items-center justify-center text-3xl shadow-inner">
              🎯
            </div>
            <h1 className="text-3xl font-black text-[var(--foreground)]">
              Welcome to WORDLY
            </h1>
            <p className="text-[var(--foreground-muted)] mt-1 text-sm max-w-sm">
              Sign in with Google to unlock all game modes, track your stats in the cloud, and compete in 1v1 duels.
            </p>
          </>
        )}
      </header>

      {/* Account Cloud Stats Overview (Only when signed in) */}
      {user ? (
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
            <div className="text-2xl font-black text-[#2ec47d] mb-0.5">{profile?.rating ?? 1200}</div>
            <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-bold">Rating (ELO)</div>
          </div>
        </div>
      ) : (
        <div className="w-full mb-8 bg-[var(--surface)] border border-[var(--surface-border)] p-6 rounded-3xl flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <Lock size={15} />
            <span>Login Required To Play</span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm">
            Stats and rankings are strictly cloud-saved to your personal account.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#2ec47d] hover:bg-[#26a86b] active:scale-[0.98] text-white font-black text-sm shadow-md shadow-[#2ec47d]/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.44 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.28 2.56 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
              />
            </svg>
            <span>Sign In with Google to Play</span>
          </button>
        </div>
      )}

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
            href="/duel" 
            className="bg-[var(--surface)] hover:bg-[var(--surface-border)] text-[var(--foreground)] border border-amber-500/30 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm text-amber-500"
          >
            <Swords size={18} /> 1V1 Online Duel
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/modes" 
            className="bg-[var(--surface)] hover:bg-[var(--surface-border)] text-[var(--foreground)] border border-[var(--surface-border)] py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
          >
            <LayoutGrid size={16} className="text-purple-400" /> {getTranslation(interfaceLanguage, 'game_modes')}
          </Link>
          <Link 
            href="/stats" 
            className="bg-[var(--surface)] hover:bg-[var(--surface-border)] text-[var(--foreground)] border border-[var(--surface-border)] py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
          >
            <Trophy size={16} className="text-blue-400" /> Leaderboard & Stats
          </Link>
        </div>
      </div>

    </main>
  );
}
