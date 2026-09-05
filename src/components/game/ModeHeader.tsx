'use client';

import { useGameStore } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';
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
  Share2, 
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

  const showTimerSetting = useSettingsStore(state => state.showTimer);
  const [showHelp, setShowHelp] = useState(false);

  const isTimedChallenge = gameMode === 'timed' || (gameMode === 'chaos' && chaosModifier?.id === 'speed');
  const timerPercentage = Math.max(0, Math.min(100, (timerSeconds / timerMaxSeconds) * 100));
  const isTimerUrgent = isTimedChallenge && timerSeconds <= 15;

  const modeDisplayName = 
    gameMode === 'classic' ? 'Classic' :
    gameMode === 'daily' ? 'Daily' :
    gameMode === 'unlimited' ? 'Practice' :
    gameMode === 'timed' ? 'Timed' :
    gameMode === 'survival' ? 'Survival' :
    gameMode === 'endless' ? 'Endless' :
    gameMode === 'chaos' ? 'Chaos' : 'Custom';

  const modeSubtitle = 
    gameMode === 'classic' ? 'STANDARD' :
    gameMode === 'daily' ? 'OFFICIAL CHALLENGE' :
    gameMode === 'unlimited' ? 'UNLIMITED' :
    gameMode === 'timed' ? 'SPEED RUSH' :
    gameMode === 'survival' ? `${survivalLives} LIVES REMAINING` :
    gameMode === 'endless' ? `STAGE ${endlessStage}` :
    gameMode === 'chaos' ? 'MODIFIERS ACTIVE' : 'USER RULES';

  return (
    <div className="w-full max-w-lg mb-4 flex flex-col gap-3">
      {/* Clean Top Header matching Image 3 */}
      <div className="flex items-center justify-between py-1">
        {/* Back button */}
        <Link
          href="/modes"
          className="h-10 w-10 rounded-2xl bg-[#191d27] border border-[#262b38] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#202532] transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>

        {/* Center Mode Title & Subtitle */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-lg font-black text-white tracking-wide">
            {modeDisplayName}
          </h1>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8e95a5]">
            {modeSubtitle}
          </span>
        </div>

        {/* Right Action Icons: Help & Stats */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="h-10 w-10 rounded-2xl bg-[#191d27] border border-[#262b38] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#202532] transition-colors"
          >
            <HelpCircle size={18} />
          </button>

          <Link
            href="/stats"
            className="h-10 w-10 rounded-2xl bg-[#191d27] border border-[#262b38] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#202532] transition-colors"
          >
            <BarChart2 size={18} />
          </Link>
        </div>
      </div>

      {/* Help Drawer / Modal if opened */}
      {showHelp && (
        <div className="bg-[#181c26] border border-[#282f42] p-4 rounded-3xl text-xs text-gray-300 flex flex-col gap-2 shadow-xl animate-in fade-in">
          <div className="font-bold text-white flex justify-between items-center">
            <span>How to Play Wordly</span>
            <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white font-black">✕</button>
          </div>
          <p>Guess the word in {maxGuesses} attempts.</p>
          <p>• Green tile: Correct letter in the exact position.</p>
          <p>• Yellow tile: Letter exists in the word but in another spot.</p>
          <p>• Dark tile: Letter does not appear in the word.</p>
          <p className="text-[#2ec47d] font-bold">💡 You have 2 FREE hints every game!</p>
        </div>
      )}

      {/* Mode-Specific Interactive HUD */}
      
      {/* 1. TIMED MODE OR CHAOS SPEED COUNTDOWN HUD */}
      {isTimedChallenge && (
        <div className="flex flex-col gap-1.5 bg-[#181c26] p-3 rounded-2xl border border-[#262b38]">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1 text-[#8e95a5]">
              <Clock size={14} className={isTimerUrgent ? 'text-red-400 animate-spin' : ''} /> Time Remaining
            </span>
            <span className={`text-sm font-black ${isTimerUrgent ? 'text-red-400 animate-pulse' : 'text-[#2ec47d]'}`}>
              {timerSeconds}s
            </span>
          </div>
          <div className="w-full h-2 bg-[#222735] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isTimerUrgent 
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

      {/* CASUAL ELAPSED TIMER HUD (if user enabled "Show Timer" in casual modes) */}
      {showTimerSetting && !isTimedChallenge && (
        <div className="flex items-center justify-between bg-[#181c26] px-4 py-2 rounded-2xl border border-[#262b38] text-xs font-bold">
          <span className="flex items-center gap-1.5 text-[#8e95a5]">
            <Clock size={14} className="text-[#2ec47d]" /> Time Elapsed
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
            <button
              onClick={async () => {
                const currentTarget = useGameStore.getState().targetWord;
                const encoded = btoa(currentTarget);
                const url = `${window.location.origin}/play?mode=custom&challenge=${encoded}&len=${wordLength}&g=${maxGuesses}`;
                await navigator.clipboard.writeText(url);
                toast.success('Challenge link copied to clipboard! Send to friends 🔗');
              }}
              className="flex items-center gap-1 text-blue-400 hover:underline"
            >
              <Share2 size={13} /> Share
            </button>
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
              toast('New practice word loaded', { icon: '🎲' });
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
