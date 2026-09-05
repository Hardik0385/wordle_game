'use client';

import { useGameStore, GameMode } from '@/store/game-store';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

const MODES: { id: GameMode; name: string; description: string; icon: string; tag: string; color: string }[] = [
  { 
    id: 'classic', 
    name: 'Classic', 
    description: 'Traditional 5-letter word game with 6 attempts. Pure, authentic Wordle.', 
    icon: '🎲',
    tag: 'ORIGINAL',
    color: 'border-emerald-500/30 hover:border-emerald-500/60'
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
    description: 'Configure 4, 5, or 6 letter words, adjust attempts, or send a secret challenge link to friends.', 
    icon: '⚙️',
    tag: 'VERSUS / SHARE',
    color: 'border-pink-500/30 hover:border-pink-500/60'
  },
];

export default function ModesPage() {
  const router = useRouter();
  const { setGameMode } = useGameStore();

  const handleSelectMode = (modeId: GameMode) => {
    if (modeId === 'daily') {
      router.push('/daily');
    } else {
      setGameMode(modeId);
      router.push(`/play?mode=${modeId}`);
    }
  };

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-2 mb-1 text-purple-600 dark:text-purple-400 font-black text-xs uppercase tracking-widest">
          <span>Game Central</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Select Game Mode</h1>
        <p className="text-gray-500 text-sm sm:text-base">Choose from fast-paced speed challenges, endless ladders, survival gauntlets, or standard play.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => handleSelectMode(mode.id)}
            className={`group relative flex flex-col items-start text-left bg-gray-50 dark:bg-gray-800/80 p-6 rounded-3xl border ${mode.color} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md`}
          >
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">{mode.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                {mode.tag}
              </span>
            </div>

            <h2 className="text-xl font-black mb-1 flex items-center gap-2">
              {mode.name}
              <Play size={14} className="opacity-0 group-hover:opacity-100 transition-opacity fill-current text-purple-500" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {mode.description}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}
