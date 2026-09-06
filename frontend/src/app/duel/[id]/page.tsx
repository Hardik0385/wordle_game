'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { syncGameResultToFirebase } from '@/lib/firebase/sync-stats';
import { evaluateGuess, LetterState } from '@/engine/guess-evaluator';
import { isValidWord, validateHardMode } from '@/engine/word-validator';
import { 
  Swords, 
  Trophy, 
  Loader2, 
  ArrowLeft, 
  SlidersHorizontal,
  Flame,
  Delete,
  CornerDownLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DuelMatchPageProps {
  params: Promise<{ id: string }>;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export default function DuelMatchPage({ params }: DuelMatchPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentGuess, setCurrentGuess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statsSynced, setStatsSynced] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (snapshot) => {
      if (snapshot.exists()) {
        setRoomData(snapshot.data());
      } else {
        toast.error('Duel room not found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const isPlayer1 = user?.uid === roomData?.player1Id;
  const isPlayer2 = user?.uid === roomData?.player2Id;
  const myGuesses: string[] = isPlayer1 ? roomData?.player1Guesses || [] : roomData?.player2Guesses || [];
  const opponentGuesses: string[] = isPlayer1 ? roomData?.player2Guesses || [] : roomData?.player1Guesses || [];
  const mySolved = isPlayer1 ? roomData?.player1Solved : roomData?.player2Solved;
  const opponentSolved = isPlayer1 ? roomData?.player2Solved : roomData?.player1Solved;
  const opponentName = isPlayer1 ? roomData?.player2Name || 'Opponent' : roomData?.player1Name || 'Host';
  const targetWord: string = roomData?.targetWord || 'CRANE';

  const wordLength: number = Number(roomData?.wordLength) || targetWord.length || 5;
  const maxGuesses: number = Number(roomData?.maxGuesses) || 6;
  const isHardMode: boolean = Boolean(roomData?.isHardMode);
  const modeType: string = roomData?.modeType || 'classic';

  const gameOver = Boolean(
    roomData?.winnerId !== null && roomData?.winnerId !== undefined
  ) || (myGuesses.length >= maxGuesses && opponentGuesses.length >= maxGuesses);

  const submitWord = useCallback(async () => {
    if (gameOver || mySolved || submitting) return;

    if (currentGuess.length !== wordLength) {
      toast.error(`Guess must be ${wordLength} letters`);
      return;
    }

    const upperGuess = currentGuess.toUpperCase();

    // Check validity against dictionary
    if (!isValidWord(upperGuess)) {
      toast.error('Not in word list');
      return;
    }

    // Check hard mode constraint if active
    if (isHardMode && myGuesses.length > 0) {
      const lastGuess = myGuesses[myGuesses.length - 1];
      const hardModeErr = validateHardMode(upperGuess, lastGuess, targetWord);
      if (hardModeErr) {
        toast.error(hardModeErr);
        return;
      }
    }

    try {
      setSubmitting(true);
      const isCorrect = upperGuess === targetWord.toUpperCase();
      const roomRef = doc(db, 'rooms', roomId);

      const updates: any = {};
      if (isPlayer1) {
        updates.player1Guesses = arrayUnion(upperGuess);
        if (isCorrect) {
          updates.player1Solved = true;
          updates.winnerId = roomData.player1Id;
          updates.status = 'finished';
        }
      } else if (isPlayer2) {
        updates.player2Guesses = arrayUnion(upperGuess);
        if (isCorrect) {
          updates.player2Solved = true;
          updates.winnerId = roomData.player2Id;
          updates.status = 'finished';
        }
      }

      await updateDoc(roomRef, updates);
      setCurrentGuess('');

      if (isCorrect) {
        toast.success('🎉 YOU WON THE DUEL!');
      }
    } catch (err: any) {
      console.error('Error submitting guess:', err);
      toast.error(err.message || 'Failed to submit guess');
    } finally {
      setSubmitting(false);
    }
  }, [
    gameOver,
    mySolved,
    submitting,
    currentGuess,
    wordLength,
    isHardMode,
    myGuesses,
    targetWord,
    roomId,
    isPlayer1,
    isPlayer2,
    roomData
  ]);

  const handleKeyInput = useCallback((key: string) => {
    if (gameOver || mySolved) return;

    if (key === 'ENTER') {
      submitWord();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [gameOver, mySolved, submitWord, currentGuess.length, wordLength]);

  // Global window key listener for typing anywhere on the page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input element
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleKeyInput('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyInput('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  // Auto sync match result to player stats in Firestore when game concludes
  useEffect(() => {
    if (!roomData || statsSynced || !user) return;
    if (roomData.winnerId !== null || gameOver) {
      const didWin = roomData.winnerId === user.uid;
      syncGameResultToFirebase(didWin, myGuesses.length, undefined, true);
      setStatsSynced(true);
    }
  }, [roomData?.winnerId, gameOver, user, statsSynced, myGuesses.length]);

  const handleLeaveAndCleanup = async () => {
    try {
      // Clean up temporary room from Firestore to avoid db bloat
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (e) {
      // Ignored if room already cleaned up by opponent
    }
    router.push('/duel');
  };

  // Determine keyboard letter states based on player's guesses
  const letterStates = new Map<string, LetterState>();
  myGuesses.forEach((guess) => {
    const evaluated = evaluateGuess(guess, targetWord);
    evaluated.forEach((e) => {
      const existingState = letterStates.get(e.letter);
      if (e.state === 'correct') {
        letterStates.set(e.letter, 'correct');
      } else if (e.state === 'present' && existingState !== 'correct') {
        letterStates.set(e.letter, 'present');
      } else if (e.state === 'absent' && existingState !== 'correct' && existingState !== 'present') {
        letterStates.set(e.letter, 'absent');
      }
    });
  });

  if (loading || !roomData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-[#2ec47d]" size={32} />
        <span className="font-bold text-sm text-[var(--foreground-muted)]">Loading duel room {roomId}...</span>
      </div>
    );
  }

  // Row and Column helper arrays
  const rowsArray = Array.from({ length: maxGuesses }, (_, i) => i);
  const colsArray = Array.from({ length: wordLength }, (_, i) => i);

  // Responsive tile size based on word length
  const tileSize =
    wordLength === 6
      ? 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base'
      : wordLength === 4
      ? 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl'
      : 'w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg';

  return (
    <main className="p-3 sm:p-6 max-w-4xl mx-auto flex flex-col gap-5 outline-none select-none">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--surface-border)] pb-3">
        <button
          onClick={handleLeaveAndCleanup}
          className="flex items-center gap-2 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          Leave & Clean Room
        </button>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2ec47d]/10 text-[#2ec47d] text-xs font-black">
            <Swords size={13} />
            ROOM: {roomId}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black">
            {wordLength} LETTERS
          </div>
          <div className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black">
            {maxGuesses} TRIES
          </div>
          {isHardMode && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-black">
              <Flame size={12} />
              HARD
            </div>
          )}
        </div>
      </div>

      {/* Winner / Finish Banner */}
      {roomData.winnerId && (
        <div
          className={`p-6 rounded-3xl text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200 ${
            roomData.winnerId === user?.uid
              ? 'bg-[#2ec47d]/15 border-2 border-[#2ec47d] text-[#2ec47d]'
              : 'bg-red-500/15 border-2 border-red-500 text-red-500'
          }`}
        >
          <Trophy size={40} />
          <h2 className="text-2xl font-black">
            {roomData.winnerId === user?.uid ? 'VICTORY! YOU WON!' : `${opponentName} WON!`}
          </h2>
          <span className="text-sm font-semibold opacity-90">
            The word was: <span className="font-black uppercase tracking-widest">{targetWord}</span>
          </span>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLeaveAndCleanup}
              className="py-2.5 px-5 rounded-2xl bg-white text-black font-extrabold text-xs shadow hover:bg-white/90 transition-all cursor-pointer"
            >
              Back to Duel Lobby (Cleans Room)
            </button>
            <Link
              href="/stats"
              onClick={handleLeaveAndCleanup}
              className="py-2.5 px-5 rounded-2xl bg-black/20 hover:bg-black/30 font-extrabold text-xs transition-all"
            >
              View Updated Stats & ELO
            </Link>
          </div>
        </div>
      )}

      {/* 2-Player Side-by-Side Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Your Board */}
        <div className="flex flex-col items-center gap-3 bg-[var(--surface)] p-4 sm:p-5 rounded-3xl border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-[#2ec47d] uppercase tracking-wider">You</span>
              {mySolved && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2ec47d]/20 text-[#2ec47d]">SOLVED</span>}
            </div>
            <span className="text-xs font-bold text-[var(--foreground-muted)]">
              {myGuesses.length} / {maxGuesses} tries
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            {rowsArray.map((rowIdx) => {
              const isCurrentRow = rowIdx === myGuesses.length;
              const guess = myGuesses[rowIdx] || (isCurrentRow ? currentGuess : '');

              return (
                <div key={rowIdx} className="flex gap-1.5 sm:gap-2">
                  {colsArray.map((colIdx) => {
                    const char = guess[colIdx] || '';
                    const isSubmitted = rowIdx < myGuesses.length;
                    let bgColor = 'bg-transparent border border-[var(--surface-border)]';

                    if (isSubmitted) {
                      if (char === targetWord[colIdx]) {
                        bgColor = 'bg-[#2ec47d] text-white border-transparent';
                      } else if (targetWord.includes(char)) {
                        bgColor = 'bg-amber-500 text-white border-transparent';
                      } else {
                        bgColor = 'bg-zinc-600 text-white border-transparent';
                      }
                    } else if (char) {
                      bgColor = 'bg-transparent border-2 border-[var(--foreground-muted)]';
                    }

                    return (
                      <div
                        key={colIdx}
                        className={`${tileSize} rounded-xl flex items-center justify-center font-black uppercase transition-all ${bgColor}`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {!gameOver && !mySolved && (
            <p className="text-[11px] text-[var(--foreground-muted)] text-center">
              Type or tap keys below & press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-border)] font-bold">Enter</kbd>
            </p>
          )}
        </div>

        {/* Opponent's Board (Live fog/progress view) */}
        <div className="flex flex-col items-center gap-3 bg-[var(--surface)] p-4 sm:p-5 rounded-3xl border border-[var(--surface-border)] opacity-90 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-blue-500 uppercase tracking-wider">{opponentName}</span>
              {opponentSolved && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2ec47d]/20 text-[#2ec47d]">SOLVED</span>}
            </div>
            <span className="text-xs font-bold text-[var(--foreground-muted)]">
              {opponentGuesses.length} / {maxGuesses} tries
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            {rowsArray.map((rowIdx) => {
              const guess = opponentGuesses[rowIdx] || '';
              const isSubmitted = rowIdx < opponentGuesses.length;

              return (
                <div key={rowIdx} className="flex gap-1.5 sm:gap-2">
                  {colsArray.map((colIdx) => {
                    const char = guess[colIdx] || '';
                    let bgColor = 'bg-transparent border border-[var(--surface-border)]';

                    if (isSubmitted) {
                      if (char === targetWord[colIdx]) {
                        bgColor = 'bg-[#2ec47d] text-white border-transparent';
                      } else if (targetWord.includes(char)) {
                        bgColor = 'bg-amber-500 text-white border-transparent';
                      } else {
                        bgColor = 'bg-zinc-600 text-white border-transparent';
                      }
                    }

                    return (
                      <div
                        key={colIdx}
                        className={`${tileSize} rounded-xl flex items-center justify-center font-black uppercase transition-all ${bgColor}`}
                      >
                        {isSubmitted ? '•' : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <span className="text-[11px] text-[var(--foreground-muted)]">
            Live opponent progress (fog of war)
          </span>
        </div>
      </div>

      {/* On-Screen Virtual Keyboard */}
      <div className="flex flex-col gap-1.5 w-full max-w-lg mx-auto mt-2 select-none">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
              const state = letterStates.get(key);

              let keyStyle = 'bg-[var(--surface-border)]/70 hover:bg-[var(--surface-border)] text-[var(--foreground)]';
              if (state === 'correct') {
                keyStyle = 'bg-[#2ec47d] text-white';
              } else if (state === 'present') {
                keyStyle = 'bg-amber-500 text-white';
              } else if (state === 'absent') {
                keyStyle = 'bg-zinc-700/60 text-zinc-400';
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyInput(key)}
                  className={`h-11 sm:h-12 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${keyStyle} ${
                    isSpecial ? 'px-2 sm:px-3 text-[11px]' : 'flex-1 max-w-[38px]'
                  }`}
                >
                  {key === 'BACKSPACE' ? (
                    <Delete size={16} />
                  ) : key === 'ENTER' ? (
                    <span className="flex items-center gap-1 font-bold">
                      ENTER <CornerDownLeft size={12} />
                    </span>
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
