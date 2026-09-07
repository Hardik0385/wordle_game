'use client';

import React, { useEffect, useState, use, useCallback, useRef } from 'react';
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
  Flame, 
  Delete, 
  CornerDownLeft, 
  Timer, 
  Wind, 
  Zap, 
  AlertTriangle,
  X,
  ChevronUp
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
  const [showMobileOpponent, setShowMobileOpponent] = useState(false);
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentGuess, setCurrentGuess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statsSynced, setStatsSynced] = useState(false);

  // Timed Rush countdown
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
  const cursedLetter: string | undefined = roomData?.cursedLetter;
  const isTimedMode = modeType === 'timed';
  const isChaosMode = modeType === 'chaos';

  const isTimeOut = isTimedMode && timeLeft <= 0;
  const gameOver = Boolean(
    roomData?.winnerId !== null && roomData?.winnerId !== undefined
  ) || (myGuesses.length >= maxGuesses && opponentGuesses.length >= maxGuesses) || isTimeOut;

  // Countdown timer for Timed Rush mode
  useEffect(() => {
    if (!isTimedMode || gameOver || mySolved) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimedMode, gameOver, mySolved]);

  const submitWord = useCallback(async () => {
    if (gameOver || mySolved || submitting) return;

    if (currentGuess.length !== wordLength) {
      toast.error(`Guess must be ${wordLength} letters`, { id: 'game-error' });
      return;
    }

    const upperGuess = currentGuess.toUpperCase();

    // Chaos Mode rule check: Cursed letter
    if (isChaosMode && cursedLetter && upperGuess.includes(cursedLetter)) {
      toast.error(`🌪️ Chaos Rule: Cursed letter '${cursedLetter}' detected!`);
      return;
    }

    // Check validity against dictionary
    if (!isValidWord(upperGuess)) {
      toast.error('Not in word list', { id: 'game-error' });
      return;
    }

    // Check hard mode constraint if active
    if (isHardMode && myGuesses.length > 0) {
      const lastGuess = myGuesses[myGuesses.length - 1];
      const hardModeErr = validateHardMode(upperGuess, lastGuess, targetWord);
      if (hardModeErr) {
        toast.error(hardModeErr, { id: 'game-error' });
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
    isChaosMode,
    cursedLetter,
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
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (e) {}
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

  const rowsArray = Array.from({ length: maxGuesses }, (_, i) => i);
  const colsArray = Array.from({ length: wordLength }, (_, i) => i);

  const tileSize =
    wordLength === 6
      ? 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base'
      : wordLength === 4
      ? 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl'
      : 'w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg';

  const opponentTileSize =
    wordLength === 6
      ? 'w-5 h-5 sm:w-8 sm:h-8 text-[10px] sm:text-xs'
      : wordLength === 4
      ? 'w-7 h-7 sm:w-10 sm:h-10 text-xs sm:text-sm'
      : 'w-6 h-6 sm:w-9 sm:h-9 text-[11px] sm:text-sm';

  return (
    <main className="p-3 sm:p-6 max-w-4xl mx-auto flex flex-col gap-4 outline-none select-none">
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

          {modeType === 'timed' && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-black animate-pulse">
              <Timer size={13} />
              TIMED RUSH: {timeLeft}s
            </div>
          )}

          {modeType === 'chaos' && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-black">
              <Wind size={13} />
              CHAOS: NO &apos;{cursedLetter}&apos;
            </div>
          )}

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

      {/* Timed Mode Progress Countdown Bar */}
      {isTimedMode && !gameOver && (
        <div className="w-full bg-[var(--surface-border)]/50 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 15 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
            }`}
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      )}

      {/* Chaos Mode Notice Banner */}
      {isChaosMode && cursedLetter && (
        <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center flex items-center justify-center gap-2 text-xs text-purple-400 font-bold">
          <AlertTriangle size={15} />
          <span>CHAOS RULE ACTIVE: Cursed letter &apos;{cursedLetter}&apos; cannot be used in any guess!</span>
        </div>
      )}

      {/* Winner / Finish Banner */}
      {(roomData.winnerId || gameOver) && (
        <div
          className={`p-6 rounded-3xl text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200 ${
            roomData.winnerId === user?.uid
              ? 'bg-[#2ec47d]/15 border-2 border-[#2ec47d] text-[#2ec47d]'
              : 'bg-red-500/15 border-2 border-red-500 text-red-500'
          }`}
        >
          <Trophy size={40} />
          <h2 className="text-2xl font-black">
            {roomData.winnerId === user?.uid
              ? 'VICTORY! YOU WON!'
              : roomData.winnerId
              ? `${opponentName} WON!`
              : isTimeOut
              ? "TIME'S UP! DRAW!"
              : 'MATCH FINISHED!'}
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

      {/* Mobile Opponent Toggle Button */}
      <button 
        onClick={() => setShowMobileOpponent(true)}
        className="md:hidden flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-3 rounded-2xl bg-[#2ec47d]/10 border border-[#2ec47d]/30 text-[#2ec47d] font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm"
      >
        <Swords size={16} />
        View {opponentName}&apos;s Progress ({opponentGuesses.length}/{maxGuesses})
      </button>

      {/* 2-Player Arena Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start w-full max-w-lg md:max-w-none mx-auto">
        {/* Your Board (Always Visible) */}
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

        {/* Desktop Opponent's Board (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col items-center gap-2 sm:gap-3 bg-[var(--surface)] p-4 sm:p-5 rounded-3xl border border-[var(--surface-border)] opacity-90 shadow-sm w-full">
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
                    } else if (char) {
                      bgColor = 'bg-transparent border-2 border-[var(--foreground-muted)]';
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

          <span className="text-[10px] sm:text-[11px] text-[var(--foreground-muted)]">
            Live opponent progress (fog of war)
          </span>
        </div>
      </div>

      {/* Mobile Opponent Bottom Sheet */}
      {showMobileOpponent && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setShowMobileOpponent(false)} 
          />
          <div className="relative bg-[var(--background)] w-full rounded-t-[2rem] border-t border-[var(--surface-border)] p-6 pb-12 animate-in slide-in-from-bottom duration-300 shadow-2xl flex flex-col items-center">
            <div className="w-12 h-1.5 bg-[var(--surface-border)] rounded-full mb-6 mx-auto" />
            
            <div className="flex items-center justify-between w-full max-w-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-blue-500 uppercase tracking-wider">{opponentName}</span>
                {opponentSolved && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2ec47d]/20 text-[#2ec47d]">SOLVED</span>}
              </div>
              <button onClick={() => setShowMobileOpponent(false)} className="p-2 bg-[var(--surface)] hover:bg-[var(--surface-border)] rounded-full transition-colors text-[var(--foreground)]">
                <X size={18} />
              </button>
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
                      } else if (char) {
                        bgColor = 'bg-transparent border-2 border-[var(--foreground-muted)]';
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
            
            <span className="text-[10px] text-[var(--foreground-muted)] mt-4">
              {opponentGuesses.length} / {maxGuesses} tries
            </span>
          </div>
        </div>
      )}

      {/* On-Screen Virtual Keyboard */}
      <div className="flex w-full flex-col gap-[min(0.25rem,1vh)] sm:gap-[min(0.375rem,1.2vh)] md:gap-[min(0.6rem,1.5vh)] max-w-lg md:max-w-2xl mx-auto opacity-70 scale-90 sm:scale-100 origin-bottom">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-[min(0.25rem,1vh)] sm:gap-[min(0.375rem,1.2vh)] md:gap-[min(0.5rem,1.2vh)] w-full">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
              const isCursed = isChaosMode && key === cursedLetter;
              const state = letterStates.get(key);

              let keyStyle = 'bg-[var(--surface-border)]/70 hover:bg-[var(--surface-border)] text-[var(--foreground)]';
              if (isCursed) {
                keyStyle = 'bg-purple-900/60 border border-purple-500 text-purple-300 opacity-60';
              } else if (state === 'correct') {
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
                  className={`h-[min(3.2rem,5.5vh)] sm:h-[min(3.5rem,6vh)] md:h-[min(3.6rem,6.5vh)] rounded-lg sm:rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${keyStyle} ${
                    isSpecial ? 'max-w-[min(3.8rem,6.5vh)] min-[360px]:max-w-[min(4.2rem,7vh)] sm:max-w-[min(4.5rem,7.5vh)] md:max-w-[min(4.8rem,8vh)] px-0.5 min-[360px]:px-1 text-[9px] min-[360px]:text-[10px] sm:text-xs tracking-tight sm:tracking-wider' : 'flex-1 max-w-[min(2.6rem,4.5vh)] sm:max-w-[min(2.8rem,5vh)] md:max-w-[min(3rem,5.5vh)]'
                  }`}
                >
                  {key === 'BACKSPACE' ? (
                    <Delete size={16} />
                  ) : key === 'ENTER' ? (
                    <span className="flex items-center gap-1 font-bold">
                      ENTER <CornerDownLeft size={12} />
                    </span>
                  ) : isCursed ? (
                    <span className="line-through">{key}</span>
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
