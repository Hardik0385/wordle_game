'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { isValidWord } from '@/engine/word-validator';
import { X, Sparkles, Share2, Play } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-extrabold">Custom Game Setup</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Word Length Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
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
                className={`py-3 rounded-2xl font-bold transition-all ${
                  length === l
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {l} Letters
              </button>
            ))}
          </div>
        </div>

        {/* Max Guesses Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
            Max Attempts
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[4, 5, 6, 7, 8].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setMaxGuesses(g)}
                className={`py-2.5 rounded-2xl font-bold transition-all ${
                  maxGuesses === g
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge a Friend with Secret Word */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider flex items-center justify-between">
            <span>Secret Word (Optional)</span>
            <span className="text-[10px] text-gray-400 font-normal">Leave blank for random</span>
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
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-center tracking-widest uppercase border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
          />
          {secretError && (
            <span className="text-xs text-red-500 font-bold">{secretError}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Play size={18} fill="currentColor" /> Start Custom Game
          </button>

          {secretWord.length === length && (
            <button
              onClick={handleCopyChallenge}
              className="w-full py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm"
            >
              <Share2 size={16} /> Copy Challenge Link for Friends
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
