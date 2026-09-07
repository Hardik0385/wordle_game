'use client';

import { useGameStore } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';
import { getTranslation } from '@/lib/translations';
import Link from 'next/link';
import { 
  ChevronLeft, 
  HelpCircle, 
  BarChart2, 
  Clock, 
  Flame, 
  Trophy, 
  Sparkles, 
  Settings, 
  Shuffle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

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
    elapsedSeconds,
    wordLength,
    maxGuesses,
    resetGame,
    customChallengeWord
  } = useGameStore();

  const { showTimer: showTimerSetting, interfaceLanguage } = useSettingsStore();
  const [showHelp, setShowHelp] = useState(false);

  const isTimedChallenge = gameMode === 'timed' || (gameMode === 'chaos' && chaosModifier?.id === 'speed');
  const timerPercentage = Math.max(0, Math.min(100, (timerSeconds / timerMaxSeconds) * 100));
  const isTimerUrgent = isTimedChallenge && timerSeconds <= 15;

  const modeDisplayName =
    gameMode === 'classic' ? getTranslation(interfaceLanguage, 'classic') :
      gameMode === 'daily' ? getTranslation(interfaceLanguage, 'daily') :
        gameMode === 'unlimited' ? 'Practice' :
          gameMode === 'timed' ? 'Timed' :
            gameMode === 'survival' ? 'Survival' :
              gameMode === 'endless' ? 'Endless' :
                gameMode === 'chaos' ? 'Chaos' : 'Custom';

  const modeSubtitle =
    gameMode === 'classic' ? getTranslation(interfaceLanguage, 'standard') :
      gameMode === 'daily' ? 'OFFICIAL CHALLENGE' :
        gameMode === 'unlimited' ? 'UNLIMITED' :
          gameMode === 'timed' ? 'SPEED RUSH' :
            gameMode === 'survival' ? `${survivalLives} LIVES REMAINING` :
              gameMode === 'endless' ? `STAGE ${endlessStage}` :
                gameMode === 'chaos' ? 'MODIFIERS ACTIVE' : 'USER RULES';

  return (
    <div className="w-full max-w-lg mb-1 sm:mb-2.5 flex flex-col gap-1.5 sm:gap-2.5 shrink-0">
      {/* Clean Top Header */}
      <div className="flex items-center justify-between py-0.5 sm:py-1">
        {/* Back button */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/modes"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </Link>
        </div>

        {/* Center Mode Title & Subtitle */}
        <div className="flex flex-col items-center text-center shrink-0">
          <h1 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-wide leading-tight">
            {modeDisplayName}
          </h1>
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[var(--foreground-muted)]">
            {modeSubtitle}
          </span>
        </div>

        {/* Right Action Icons: Help & Stats */}
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <Link
            href="/stats"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            <BarChart2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Link>
        </div>
      </div>

      {/* Help Drawer / Modal if opened */}
      {showHelp && (
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs text-[var(--foreground-muted)] flex flex-col gap-1.5 sm:gap-2 shadow-xl animate-in fade-in">
          <div className="font-bold text-[var(--foreground)] flex justify-between items-center">
            <span>{getTranslation(interfaceLanguage, 'how_to_play')}</span>
            <button onClick={() => setShowHelp(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] font-black">✕</button>
          </div>
          <p>{getTranslation(interfaceLanguage, 'rules_desc')} ({maxGuesses})</p>
          <p>• {getTranslation(interfaceLanguage, 'green_tile')}</p>
          <p>• {getTranslation(interfaceLanguage, 'yellow_tile')}</p>
          <p>• {getTranslation(interfaceLanguage, 'dark_tile')}</p>
          <p className="text-[#2ec47d] font-bold">💡 {getTranslation(interfaceLanguage, 'one_hint_notice')}</p>
        </div>
      )}

      {/* Mode-Specific Interactive HUD */}

      {/* 1. TIMED MODE OR CHAOS SPEED COUNTDOWN HUD */}
      {isTimedChallenge && (
        <div className="flex flex-col gap-1.5 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--surface-border)]">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
              <Clock size={14} className={isTimerUrgent ? 'text-red-400 animate-spin' : ''} /> {getTranslation(interfaceLanguage, 'time_remaining')}
            </span>
            <span className={`text-sm font-black ${isTimerUrgent ? 'text-red-400 animate-pulse' : 'text-[#2ec47d]'}`}>
              {timerSeconds}s
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${isTimerUrgent
                  ? 'bg-red-500 animate-pulse'
                  : timerSeconds <= 30
                    ? 'bg-amber-500'
                    : 'bg-[#2ec47d]'
                }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* CASUAL ELAPSED TIMER HUD */}
      {showTimerSetting && !isTimedChallenge && (
        <div className="flex items-center justify-between bg-[var(--surface)] px-4 py-2 rounded-2xl border border-[var(--surface-border)] text-xs font-bold">
          <span className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
            <Clock size={14} className="text-[#2ec47d]" /> {getTranslation(interfaceLanguage, 'time_elapsed')}
          </span>
          <span className="text-sm font-black text-[#2ec47d] font-mono tabular-nums">
            {Math.floor((elapsedSeconds || 0) / 60)}:{String((elapsedSeconds || 0) % 60).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* 2. SURVIVAL MODE HUD */}
      {gameMode === 'survival' && (
        <div className="flex items-center justify-between bg-[#181c26] p-3 rounded-2xl border border-[#262b38]">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#8e95a5] uppercase mr-1">Lives:</span>
            {Array.from({ length: survivalMaxLives }).map((_, i) => (
              <span key={i} className="text-base transition-transform hover:scale-125">
                {i < survivalLives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1 text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-xl">
              <Flame size={14} /> Streak: {survivalStreak}
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Trophy size={13} /> Best: {survivalBest}
            </div>
          </div>
        </div>
      )}

      {/* 3. ENDLESS MODE HUD */}
      {gameMode === 'endless' && (
        <div className="flex items-center justify-between bg-[#181c26] p-3 rounded-2xl border border-[#262b38]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#8e95a5] uppercase">Current Tier</span>
            <span className="text-xs font-extrabold text-[#2ec47d]">
              Stage {endlessStage} • {wordLength} Letters ({maxGuesses} Guesses)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-amber-950/40 text-amber-400 px-3 py-1.5 rounded-xl font-black text-xs">
            <Sparkles size={14} /> {endlessScore.toLocaleString()} PTS
          </div>
        </div>
      )}

      {/* 4. CHAOS MODE HUD */}
      {gameMode === 'chaos' && chaosModifier && (
        <div className="flex flex-col gap-1 bg-[#181c26] p-3 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-xs text-purple-400 uppercase tracking-wider">
              <span>{chaosModifier.icon}</span>
              <span>RULE: {chaosModifier.name}</span>
            </div>
            {chaosModifier.id === 'speed' && (
              <span className={`text-xs font-black ${timerSeconds <= 10 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
                {timerSeconds}s
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 font-medium">
            {chaosModifier.description}
          </p>
        </div>
      )}

      {/* 5. CUSTOM MODE HUD */}
      {gameMode === 'custom' && (
        <div className="flex items-center justify-between bg-[#181c26] p-3 rounded-2xl border border-[#262b38] text-xs font-bold">
          <div className="text-[#8e95a5]">
            Rules: <span className="text-white">{wordLength} letters</span> • <span className="text-white">{maxGuesses} attempts</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCustomModal && (
              <button
                type="button"
                onClick={onOpenCustomModal}
                className="text-xs text-[#2ec47d] hover:underline flex items-center gap-1"
              >
                <Settings size={13} /> Rules
              </button>
            )}
          </div>
        </div>
      )}

      {/* Unlimited Skip Word Option */}
      {gameMode === 'unlimited' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              resetGame();
              toast('New practice word loaded', { icon: '🎲', id: 'mode-header-toast' });
            }}
            className="text-xs font-bold px-3 py-1 rounded-xl bg-[#181c26] border border-[#262b38] text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Shuffle size={12} /> Skip Word
          </button>
        </div>
      )}
    </div>
  );
}
