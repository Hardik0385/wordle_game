'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { isValidWord } from '@/engine/word-validator';
import { X, Share2, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CustomGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomGameModal({ isOpen, onClose }: CustomGameModalProps) {
  const { configureCustom, customWordLength, customMaxGuesses } = useGameStore();

  const [length, setLength] = useState<number>(customWordLength || 5);
  const [maxGuesses, setMaxGuesses] = useState<number>(customMaxGuesses || 6);
  const [secretWord, setSecretWord] = useState<string>('');
  const [secretError, setSecretError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartGame = () => {
    let wordToUse: string | undefined = undefined;
    if (secretWord.trim()) {
      const cleaned = secretWord.trim().toUpperCase();
      if (cleaned.length !== length) {
        setSecretError(`Secret word must be exactly ${length} letters long.`);
        return;
      }
      if (!isValidWord(cleaned)) {
        setSecretError('Secret word is not in the dictionary.');
        return;
      }
      wordToUse = cleaned;
    }

    configureCustom(length, maxGuesses, wordToUse);
    toast.success('Custom game configured!');
    onClose();
  };

  const handleCopyChallenge = async () => {
    const cleaned = secretWord.trim().toUpperCase();
    if (!cleaned) {
      setSecretError('Please type a secret word first to generate a challenge link.');
      return;
    }
    if (cleaned.length !== length) {
      setSecretError(`Secret word must be exactly ${length} letters long.`);
      return;
    }
    if (!isValidWord(cleaned)) {
      setSecretError('Secret word is not in the dictionary.');
      return;
    }

    const encoded = btoa(cleaned);
    const challengeUrl = `${window.location.origin}/play?mode=custom&challenge=${encoded}&len=${length}&g=${maxGuesses}`;
    await navigator.clipboard.writeText(challengeUrl);
    toast.success('Challenge link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#181c26] border border-[#262b39] w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#262b39] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-lg font-black text-white">Custom Game Setup</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#222735] text-[#8e95a5] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Word Length Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase text-[#8e95a5] tracking-wider">
            Word Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[4, 5, 6].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLength(l);
                  setSecretWord('');
                  setSecretError(null);
                }}
                className={`py-2.5 rounded-2xl font-bold text-xs transition-all ${
                  length === l
                    ? 'bg-[#2ec47d] text-black shadow-md scale-[1.02]'
                    : 'bg-[#222735] text-gray-300 hover:bg-[#2a3040] border border-[#2c3243]'
                }`}
              >
                {l} Letters
              </button>
            ))}
          </div>
        </div>

        {/* Max Guesses Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase text-[#8e95a5] tracking-wider">
            Max Attempts
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[4, 5, 6, 7, 8].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setMaxGuesses(g)}
                className={`py-2 rounded-2xl font-bold text-xs transition-all ${
                  maxGuesses === g
                    ? 'bg-[#2ec47d] text-black shadow-md scale-[1.02]'
                    : 'bg-[#222735] text-gray-300 hover:bg-[#2a3040] border border-[#2c3243]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge a Friend with Secret Word */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase text-[#8e95a5] tracking-wider flex items-center justify-between">
            <span>Secret Word (Optional)</span>
            <span className="text-[10px] text-gray-500 font-normal">Leave blank for random</span>
          </label>
          <input
            type="text"
            maxLength={length}
            placeholder={`Enter a ${length}-letter word`}
            value={secretWord}
            onChange={(e) => {
              setSecretWord(e.target.value.toUpperCase());
              setSecretError(null);
            }}
            className="w-full px-4 py-2.5 bg-[#12151c] rounded-2xl font-black text-center tracking-widest uppercase border border-[#2c3243] text-white focus:outline-none focus:border-[#2ec47d] text-sm"
          />
          {secretError && (
            <span className="text-xs text-red-400 font-bold">{secretError}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={handleStartGame}
            className="w-full py-3.5 rounded-2xl bg-[#2ec47d] hover:bg-[#28b371] text-black font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#2ec47d]/20"
          >
            <Play size={16} fill="currentColor" /> Start Custom Game
          </button>

          {secretWord.length === length && (
            <button
              onClick={handleCopyChallenge}
              className="w-full py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors text-xs"
            >
              <Share2 size={14} /> Copy Challenge Link for Friends
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
