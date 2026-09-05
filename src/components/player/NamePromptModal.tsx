'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/player-store';
import { toast } from 'react-hot-toast';
import { Sparkles, User, ArrowRight } from 'lucide-react';

export function NamePromptModal() {
  const { name, hasPromptedName, setName, setHasPromptedName } = usePlayerStore();
  const [mounted, setMounted] = useState(false);
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show if mounted, user has not been prompted yet, and name is not already established
  if (!mounted || hasPromptedName) {
    return null;
  }

  const handleSave = (chosenName?: string) => {
    const finalName = (chosenName || inputName).trim() || 'Player';
    setName(finalName);
    setHasPromptedName(true);
    toast.success(`Welcome to WORDLY, ${finalName}! 🎉`, {
      icon: '👋',
      duration: 4000,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#2ec47d]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mini Wordle Tiles Brand Display */}
        <div className="flex gap-1.5 mb-5">
          <div className="h-10 w-10 rounded-xl bg-[#2ec47d] text-white font-black text-lg flex items-center justify-center shadow-md shadow-[#2ec47d]/20">
            W
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#d39e33] text-white font-black text-lg flex items-center justify-center shadow-md shadow-[#d39e33]/20">
            O
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#0284c7] text-white font-black text-lg flex items-center justify-center shadow-md shadow-[#0284c7]/20">
            R
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#222735] border border-[#2c3243] text-gray-300 font-black text-lg flex items-center justify-center shadow-md">
            D
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight mb-2">
          Welcome to WORDLY!
        </h2>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-xs mb-6 font-medium leading-relaxed">
          What should we call you? Enter your name or nickname to track your daily streaks, level XP, and stats.
        </p>

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--foreground-muted)]">
              <User size={18} />
            </div>
            <input
              type="text"
              autoFocus
              maxLength={20}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] text-base font-bold text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]/50 focus:border-[#2ec47d] focus:ring-2 focus:ring-[#2ec47d]/20 focus:outline-none transition-all"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[var(--foreground-muted)] mr-1">Suggestions:</span>
            {['WordMaster', 'PuzzlePro', 'Lexicon'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInputName(suggestion)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--background)] hover:bg-[var(--surface-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--surface-border)] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              type="submit"
              disabled={!inputName.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2ec47d]/20 transition-all active:scale-[0.98]"
            >
              <span>Start Playing</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleSave('Player')}
              className="text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-1.5 transition-colors"
            >
              Continue as &quot;Player&quot;
            </button>
          </div>
        </form>

        <div className="mt-4 text-[10px] text-[var(--foreground-muted)] flex items-center gap-1 opacity-70">
          <Sparkles size={12} />
          <span>Saved to this device. You can change it anytime in Settings.</span>
        </div>

      </div>
    </div>
  );
}
