'use client';

import { useGameStore } from '@/store/game-store';
import Link from 'next/link';
import { Clock, Flame, Heart, Shuffle, ArrowRight, Settings, Share2, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModeHeaderProps {
  onOpenCustomModal?: () => void;
}

export function ModeHeader({ onOpenCustomModal }: ModeHeaderProps) {
  const { 
    gameMode, 
    timerSeconds, 
    timerMaxSeconds, 
    survivalLives, 
    survivalMaxLives, 
    survivalStreak, 
    survivalBest, 
    endlessStage, 
    endlessScore, 
    chaosModifier,
    wordLength,
    maxGuesses,
    resetGame,
    customChallengeWord
  } = useGameStore();

  const timerPercentage = Math.max(0, Math.min(100, (timerSeconds / timerMaxSeconds) * 100));
  const isTimerUrgent = timerSeconds <= 15;

  return (
    <div className="w-full max-w-lg mb-6 flex flex-col gap-3">
      {/* Top row: Mode Title & Change Mode Link */}
      <div className="flex items-center justify-between py-2 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {gameMode === 'classic' && '🎲'}
            {gameMode === 'daily' && '📅'}
            {gameMode === 'unlimited' && '♾️'}
            {gameMode === 'timed' && '⏱️'}
            {gameMode === 'survival' && '🔥'}
            {gameMode === 'endless' && '📈'}
            {gameMode === 'chaos' && '🌪️'}
            {gameMode === 'custom' && '⚙️'}
          </span>
          <span className="font-extrabold tracking-wider uppercase text-sm sm:text-base">
            {gameMode === 'classic' && 'Classic Mode'}
            {gameMode === 'daily' && 'Daily Challenge'}
            {gameMode === 'unlimited' && 'Unlimited Practice'}
            {gameMode === 'timed' && 'Timed Rush'}
            {gameMode === 'survival' && 'Survival Gauntlet'}
            {gameMode === 'endless' && `Endless Climber (Stage ${endlessStage})`}
            {gameMode === 'chaos' && 'Chaos Mode'}
            {gameMode === 'custom' && (customChallengeWord ? 'Friend Challenge' : 'Custom Game')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {gameMode === 'unlimited' && (
            <button
              onClick={() => {
                resetGame();
                toast('Loaded new practice word', { icon: '🎲' });
              }}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors"
            >
              <Shuffle size={13} /> Skip
            </button>
          )}

          {gameMode === 'custom' && (
            <button
              onClick={onOpenCustomModal}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors"
            >
              <Settings size={13} /> Rules
            </button>
          )}

          <Link
            href="/modes"
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            Change Mode
          </Link>
        </div>
      </div>

      {/* Mode-Specific Interactive HUD */}
      
      {/* 1. TIMED MODE HUD */}
      {gameMode === 'timed' && (
        <div className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock size={14} className={isTimerUrgent ? 'text-red-500 animate-spin' : ''} /> Time Remaining
            </span>
            <span className={`text-base font-black ${isTimerUrgent ? 'text-red-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {timerSeconds}s
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isTimerUrgent 
                  ? 'bg-red-500 animate-pulse' 
                  : timerSeconds <= 30 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. SURVIVAL MODE HUD */}
      {gameMode === 'survival' && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase mr-1">Lives:</span>
            {Array.from({ length: survivalMaxLives }).map((_, i) => (
              <span key={i} className="text-lg transition-transform hover:scale-125">
                {i < survivalLives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-xl">
              <Flame size={14} /> Streak: {survivalStreak}
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Trophy size={13} /> Best: {survivalBest}
            </div>
          </div>
        </div>
      )}

      {/* 3. ENDLESS MODE HUD */}
      {gameMode === 'endless' && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase">Current Tier</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              Stage {endlessStage} • {wordLength} Letters ({maxGuesses} Guesses)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl font-black text-sm">
            <Sparkles size={15} /> {endlessScore.toLocaleString()} PTS
          </div>
        </div>
      )}

      {/* 4. CHAOS MODE HUD */}
      {gameMode === 'chaos' && chaosModifier && (
        <div className="flex flex-col gap-1 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 p-3 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <span>{chaosModifier.icon}</span>
              <span>CHAOS RULE: {chaosModifier.name}</span>
            </div>
            {chaosModifier.id === 'speed' && (
              <span className={`text-xs font-black ${timerSeconds <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-500'}`}>
                {timerSeconds}s
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            {chaosModifier.description}
          </p>
        </div>
      )}

      {/* 5. CUSTOM MODE HUD */}
      {gameMode === 'custom' && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-bold">
          <div className="text-gray-500">
            Rules: <span className="text-foreground">{wordLength} letters</span> • <span className="text-foreground">{maxGuesses} attempts</span>
          </div>

          <button
            onClick={async () => {
              const currentTarget = useGameStore.getState().targetWord;
              const encoded = btoa(currentTarget);
              const url = `${window.location.origin}/play?mode=custom&challenge=${encoded}&len=${wordLength}&g=${maxGuesses}`;
              await navigator.clipboard.writeText(url);
              toast.success('Challenge link copied to clipboard! Send it to a friend 🔗');
            }}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Share2 size={13} /> Share Challenge
          </button>
        </div>
      )}
    </div>
  );
}
