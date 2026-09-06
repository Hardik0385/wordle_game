'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Trophy, Medal, Award, Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  rating: number;
  gamesWon: number;
  gamesPlayed: number;
}

export function OnlineLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('rating', 'desc'),
          limit(25)
        );
        const querySnapshot = await getDocs(q);
        const fetched: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            uid: doc.id,
            displayName: data.displayName || 'Anonymous Player',
            photoURL: data.photoURL || null,
            rating: data.rating ?? 1200,
            gamesWon: data.gamesWon ?? 0,
            gamesPlayed: data.gamesPlayed ?? 0,
          });
        });
        setLeaders(fetched);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-[var(--foreground-muted)]">
        <Loader2 className="animate-spin text-[#2ec47d]" size={32} />
        <span className="font-semibold text-sm">Loading global leaderboard...</span>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-8 text-center flex flex-col items-center gap-3">
        <Trophy className="text-[#2ec47d]" size={40} />
        <h3 className="font-black text-lg">No players ranked yet</h3>
        <p className="text-sm text-[var(--foreground-muted)] max-w-sm">
          Sign in and play games to claim the #1 spot on the global leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {leaders.map((player, index) => {
        const isCurrent = user?.uid === player.uid;
        const rank = index + 1;

        return (
          <div
            key={player.uid}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              isCurrent
                ? 'bg-[#2ec47d]/10 border-[#2ec47d] shadow-sm'
                : 'bg-[var(--surface)] border-[var(--surface-border)] hover:border-[var(--foreground-muted)]/40'
            }`}
          >
            {/* Rank badge */}
            <div className="w-8 flex items-center justify-center font-black text-lg">
              {rank === 1 ? (
                <Medal className="text-amber-400" size={24} />
              ) : rank === 2 ? (
                <Medal className="text-slate-300" size={24} />
              ) : rank === 3 ? (
                <Medal className="text-amber-700" size={24} />
              ) : (
                <span className="text-[var(--foreground-muted)] text-sm">#{rank}</span>
              )}
            </div>

            {/* Avatar */}
            {player.photoURL ? (
              <img
                src={player.photoURL}
                alt={player.displayName || 'Player'}
                className="w-10 h-10 rounded-full border border-[var(--surface-border)] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2ec47d] to-[#10b981] flex items-center justify-center font-black text-white text-sm">
                {player.displayName ? player.displayName[0].toUpperCase() : 'P'}
              </div>
            )}

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm truncate">
                  {player.displayName}
                </span>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#2ec47d] text-white">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--foreground-muted)] flex items-center gap-3 mt-0.5">
                <span>{player.gamesWon} wins</span>
                <span>•</span>
                <span>{player.gamesPlayed > 0 ? Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0}% win rate</span>
              </div>
            </div>

            {/* ELO Rating */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 font-black text-sm text-[#2ec47d]">
                <Flame size={15} />
                <span>{player.rating}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] tracking-wider">
                ELO
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
