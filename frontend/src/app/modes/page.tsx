'use client';

import { useGameStore, GameMode } from '@/store/game-store';
import { useRouter } from 'next/navigation';
import { Play, Swords, Sparkles } from 'lucide-react';

const SOLO_MODES: { id: GameMode; name: string; description: string; icon: string; tag: string; color: string }[] = [
  { 
    id: 'classic', 
    name: 'Classic', 
    description: 'Traditional 5-letter word game with 6 attempts. Pure, authentic Wordle.', 
    icon: '🎲',
    tag: 'ORIGINAL',
    color: 'border-[#2ec47d]/30 hover:border-[#2ec47d]/60'
  },
  { 
    id: 'daily', 
    name: 'Daily Challenge', 
    description: 'One official challenge every day. Everyone in the world gets the exact same word.', 
    icon: '📅',
    tag: 'DAILY',
    color: 'border-blue-500/30 hover:border-blue-500/60'
  },
  { 
    id: 'unlimited', 
    name: 'Unlimited Practice', 
    description: 'Play unlimited randomly selected puzzles. Perfect for warming up with no pressure.', 
    icon: '♾️',
    tag: 'PRACTICE',
    color: 'border-cyan-500/30 hover:border-cyan-500/60'
  },
  { 
    id: 'timed', 
    name: 'Timed Rush', 
    description: 'Race against the clock! Solve the word before the 60s countdown hits zero.', 
    icon: '⏱️',
    tag: '60s TIMER',
    color: 'border-red-500/30 hover:border-red-500/60'
  },
  { 
    id: 'survival', 
    name: 'Survival Gauntlet', 
    description: 'Start with 3 lives. Solve continuous words to build your ultimate survival streak!', 
    icon: '🔥',
    tag: '3 LIVES',
    color: 'border-orange-500/30 hover:border-orange-500/60'
  },
  { 
    id: 'endless', 
    name: 'Endless Climber', 
    description: 'Progressive challenge: starts at 4 letters, scales to 6 letters and stricter attempts!', 
    icon: '📈',
    tag: 'STAGES',
    color: 'border-indigo-500/30 hover:border-indigo-500/60'
  },
  { 
    id: 'chaos', 
    name: 'Chaos Mode', 
    description: 'Wild unpredictable modifiers: fog of war, cursed forbidden letters, or vowel locks!', 
    icon: '🌪️',
    tag: 'MODIFIERS',
    color: 'border-purple-500/30 hover:border-purple-500/60'
  },
  { 
    id: 'custom', 
    name: 'Custom Game', 
    description: 'Configure 4, 5, or 6 letter words and customize max attempts to your liking.', 
    icon: '⚙️',
    tag: 'CUSTOM RULES',
    color: 'border-pink-500/30 hover:border-pink-500/60'
  },
];

// Exactly 2 online 1v1 multiplayer cards
const ONLINE_MODES = [
  { 
    id: 'duel-classic', 
    name: '1V1 Classic Duel', 
    description: 'Real-time head-to-head battle! Race an online opponent on the standard 5-letter secret word.', 
    icon: '⚔️',
    tag: 'ONLINE 1V1',
    color: 'border-[#2ec47d]/40 hover:border-[#2ec47d]/80'
  },
  { 
    id: 'duel-modes', 
    name: '1V1 Mode Arena', 
    description: 'Play 1v1 online in special modes: 60s Timed Rush, Chaos Modifiers, or Custom Word Lengths!', 
    icon: '⚡',
    tag: 'ONLINE MODES',
    color: 'border-indigo-500/40 hover:border-indigo-500/80'
  },
];

export default function ModesPage() {
  const router = useRouter();
  const { setGameMode, gameMode, status, guesses, maxGuesses, savedGamesByMode } = useGameStore();

  const handleSelectMode = (modeId: string) => {
    if (modeId === 'duel-classic' || modeId === 'duel') {
      router.push('/duel?tab=classic');
    } else if (modeId === 'duel-modes') {
      router.push('/duel?tab=modes');
    } else if (modeId === 'daily') {
      router.push('/daily');
    } else if (modeId === 'custom') {
      router.push('/play?mode=custom');
    } else {
      if (modeId === gameMode && status === 'playing') {
        router.push(`/play?mode=${modeId}`);
      } else {
        setGameMode(modeId as GameMode);
        router.push(`/play?mode=${modeId}`);
      }
    }
  };

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-8 select-none">
      <header>
        <div className="flex items-center gap-2 mb-1 text-[#2ec47d] font-black text-xs uppercase tracking-widest">
          <Sparkles size={14} />
          <span>Game Central</span>
        </div>
        <h1 className="text-3xl font-black text-[var(--foreground)] mb-1">Select Game Mode</h1>
        <p className="text-[var(--foreground-muted)] text-sm sm:text-base">
          Choose from single-player challenges or jump into real-time live 1v1 multiplayer duels.
        </p>
      </header>

      {/* Online 1V1 Section (Exactly 2 Cards) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
          <Swords size={16} />
          <span>Online 1V1 Multiplayer (Real-Time)</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3.5">
          {ONLINE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`group relative flex flex-col items-start text-left bg-[var(--surface)] p-6 rounded-3xl border ${mode.color} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lg cursor-pointer`}
            >
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2ec47d]/15 text-[#2ec47d] border border-[#2ec47d]/20">
                  {mode.tag}
                </span>
              </div>

              <h2 className="text-lg font-black text-[var(--foreground)] mb-1 flex items-center gap-2">
                {mode.name}
                <Play size={13} className="opacity-0 group-hover:opacity-100 transition-opacity fill-current text-[#2ec47d]" />
              </h2>
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                {mode.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Solo Modes Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[var(--foreground-muted)] font-black text-xs uppercase tracking-widest">
          <span>Solo Puzzles & Challenges</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3.5">
          {SOLO_MODES.map((mode) => {
            const isCurrentActive = mode.id === gameMode && status === 'playing' && guesses.length > 0;
            const saved = savedGamesByMode?.[mode.id];
            const hasSavedGame = isCurrentActive || (saved && saved.status === 'playing' && saved.guesses.length > 0);
            const savedCount = isCurrentActive ? guesses.length : (saved?.guesses.length || 0);
            const allowedGuesses = isCurrentActive ? maxGuesses : (saved?.maxGuesses || 6);

            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`group relative flex flex-col items-start text-left bg-[var(--surface)] p-6 rounded-3xl border ${mode.color} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lg cursor-pointer`}
              >
                <div className="w-full flex items-center justify-between mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                  <div className="flex items-center gap-1.5">
                    {hasSavedGame && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        In Progress ({savedCount}/{allowedGuesses})
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[var(--foreground-muted)]">
                      {mode.tag}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-black text-[var(--foreground)] mb-1 flex items-center gap-2">
                  {mode.name}
                  <Play size={13} className="opacity-0 group-hover:opacity-100 transition-opacity fill-current text-[#2ec47d]" />
                </h2>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
