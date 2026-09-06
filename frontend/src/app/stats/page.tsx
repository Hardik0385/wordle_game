'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/player-store';
import { useAuth } from '@/context/AuthContext';
import { OnlineLeaderboard } from '@/components/player/OnlineLeaderboard';
import { Trophy, BarChart3, CloudUpload } from 'lucide-react';

export default function StatsPage() {
  const { name, stats } = usePlayerStore();
  const { user, syncLocalStats } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal');

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8">Loading stats...</div>;

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  const maxDistribution = Math.max(...Object.values(stats.guessesDistribution), 1);

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold mb-1">Leaderboards & Stats</h1>
            {user && (
              <button
                onClick={syncLocalStats}
                title="Sync local games & streak to Firebase"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2ec47d]/40 text-[#2ec47d] hover:bg-[#2ec47d]/10 text-xs font-bold transition-colors cursor-pointer"
              >
                <CloudUpload size={13} />
                Sync to Cloud
              </button>
            )}
          </div>
          <p className="text-[var(--foreground-muted)] text-sm">Track your progress and compete with global players</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[var(--surface-border)]/30 p-1 rounded-2xl border border-[var(--surface-border)] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-[#2ec47d] text-white shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <BarChart3 size={15} />
            My Stats
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'global'
                ? 'bg-[#2ec47d] text-white shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Trophy size={15} />
            Global Leaderboard
          </button>
        </div>
      </header>

      {activeTab === 'global' ? (
        <OnlineLeaderboard />
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Played" value={stats.gamesPlayed} />
            <StatCard title="Win %" value={winPercentage} />
            <StatCard title="Current Streak" value={stats.currentStreak} />
            <StatCard title="Best Streak" value={stats.bestStreak} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-4">
            {/* Guess Distribution */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Guess Distribution</h2>
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const count = stats.guessesDistribution[num] || 0;
                  const width = Math.max(7, Math.round((count / maxDistribution) * 100));
                  return (
                    <div key={num} className="flex items-center gap-2">
                      <div className="w-4 text-right font-bold">{num}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-6 rounded overflow-hidden relative">
                        <div 
                          className={`h-full flex items-center justify-end px-2 font-bold text-xs text-white ${count > 0 ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}
                          style={{ width: `${width}%` }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progression */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-4">Progression</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-2xl font-bold">
                  {stats.level}
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Level</div>
                  <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()} XP</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Next level at {Math.pow(stats.level, 2) * 100} XP
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function StatCard({ title, value }: { title: string, value: number | string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
      <div className="text-3xl font-extrabold mb-1">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{title}</div>
    </div>
  );
}
