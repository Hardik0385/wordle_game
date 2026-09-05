'use client';

import { usePlayerStore } from '@/store/player-store';
import { Trophy, Zap, Target, Book, Moon, Palette } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Win', description: 'Win your first game.', icon: Trophy, reqGamesWon: 1 },
  { id: 'on_fire', name: 'On Fire', description: 'Achieve a 5-game streak.', icon: Zap, reqStreak: 5 },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Achieve a 20-game streak.', icon: Zap, reqStreak: 20 },
  { id: 'word_master', name: 'Word Master', description: 'Win 100 games.', icon: Target, reqGamesWon: 100 },
];

export default function AchievementsPage() {
  const { stats } = usePlayerStore();

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-extrabold mb-2">Achievements</h1>
        <p className="text-gray-500">Unlock these by playing and winning games.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map(ach => {
          const Icon = ach.icon;
          
          let unlocked = false;
          if (ach.reqGamesWon && stats.gamesWon >= ach.reqGamesWon) unlocked = true;
          if (ach.reqStreak && stats.bestStreak >= ach.reqStreak) unlocked = true;
          
          return (
            <div 
              key={ach.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${unlocked ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 opacity-50 grayscale'}`}
            >
              <div className={`p-4 rounded-full ${unlocked ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <Icon size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{ach.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ach.description}</p>
                {unlocked && <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-1 uppercase tracking-widest">Unlocked</p>}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
