'use client';

import React, { useEffect, useState, use } from 'react';
import { doc, onSnapshot, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { syncGameResultToFirebase } from '@/lib/firebase/sync-stats';
import { Swords, Trophy, Loader2, CheckCircle2, XCircle, ArrowLeft, Trash2, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DuelMatchPageProps {
  params: Promise<{ id: string }>;
}

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

  if (loading || !roomData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-[#2ec47d]" size={32} />
        <span className="font-bold text-sm text-[var(--foreground-muted)]">Loading duel room {roomId}...</span>
      </div>
    );
  }

  const isPlayer1 = user?.uid === roomData.player1Id;
  const isPlayer2 = user?.uid === roomData.player2Id;
  const myGuesses: string[] = isPlayer1 ? roomData.player1Guesses || [] : roomData.player2Guesses || [];
  const opponentGuesses: string[] = isPlayer1 ? roomData.player2Guesses || [] : roomData.player1Guesses || [];
  const mySolved = isPlayer1 ? roomData.player1Solved : roomData.player2Solved;
  const opponentSolved = isPlayer1 ? roomData.player2Solved : roomData.player1Solved;
  const opponentName = isPlayer1 ? roomData.player2Name || 'Opponent' : roomData.player1Name || 'Host';
  const targetWord: string = roomData.targetWord || 'CRANE';
  const gameOver = roomData.winnerId !== null || (myGuesses.length >= 6 && opponentGuesses.length >= 6);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver || mySolved) return;

    if (e.key === 'Enter') {
      submitWord();
    } else if (e.key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + e.key.toUpperCase());
    }
  };

  const submitWord = async () => {
    if (currentGuess.length !== 5) {
      toast.error('Guess must be 5 letters');
      return;
    }

    try {
      setSubmitting(true);
      const isCorrect = currentGuess.toUpperCase() === targetWord.toUpperCase();
      const newGuesses = [...myGuesses, currentGuess.toUpperCase()];
      const roomRef = doc(db, 'rooms', roomId);

      const updates: any = {};
      if (isPlayer1) {
        updates.player1Guesses = arrayUnion(currentGuess.toUpperCase());
        if (isCorrect) {
          updates.player1Solved = true;
          updates.winnerId = roomData.player1Id;
          updates.status = 'finished';
        }
      } else if (isPlayer2) {
        updates.player2Guesses = arrayUnion(currentGuess.toUpperCase());
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
  };

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

  return (
    <main
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-6 outline-none focus:outline-none select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
        <button
          onClick={handleLeaveAndCleanup}
          className="flex items-center gap-2 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          Leave Match & Clean Room
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#2ec47d]/10 text-[#2ec47d] text-xs font-black">
          <Swords size={14} />
          ROOM: {roomId}
        </div>
      </div>

      {/* Winner Banner */}
      {roomData.winnerId && (
        <div className={`p-6 rounded-3xl text-center flex flex-col items-center gap-3 ${
          roomData.winnerId === user?.uid 
            ? 'bg-[#2ec47d]/15 border-2 border-[#2ec47d] text-[#2ec47d]' 
            : 'bg-red-500/15 border-2 border-red-500 text-red-500'
        }`}>
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
              className="py-2 px-5 rounded-2xl bg-white text-black font-extrabold text-xs shadow hover:bg-white/90 transition-all cursor-pointer"
            >
              Back to Duel Lobby (Cleans Room)
            </button>
            <Link
              href="/stats"
              onClick={handleLeaveAndCleanup}
              className="py-2 px-5 rounded-2xl bg-black/20 hover:bg-black/30 font-extrabold text-xs transition-all"
            >
              View Updated Stats & ELO
            </Link>
          </div>
        </div>
      )}

      {/* 2-Player Side-by-Side Arena */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Your Board */}
        <div className="flex flex-col items-center gap-4 bg-[var(--surface)] p-6 rounded-3xl border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between w-full">
            <span className="font-black text-sm text-[#2ec47d] uppercase tracking-wider">You</span>
            <span className="text-xs font-bold text-[var(--foreground-muted)]">{myGuesses.length} / 6 tries</span>
          </div>

          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
              const isCurrentRow = rowIdx === myGuesses.length;
              const guess = myGuesses[rowIdx] || (isCurrentRow ? currentGuess : '');

              return (
                <div key={rowIdx} className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((colIdx) => {
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
                    }

                    return (
                      <div
                        key={colIdx}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg uppercase transition-all ${bgColor}`}
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
            <p className="text-xs text-[var(--foreground-muted)] mt-2">
              Type on your keyboard & press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-border)] font-bold">Enter</kbd>
            </p>
          )}
        </div>

        {/* Opponent's Board (Live fog/progress view) */}
        <div className="flex flex-col items-center gap-4 bg-[var(--surface)] p-6 rounded-3xl border border-[var(--surface-border)] opacity-90 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <span className="font-black text-sm text-blue-500 uppercase tracking-wider">{opponentName}</span>
            <span className="text-xs font-bold text-[var(--foreground-muted)]">{opponentGuesses.length} / 6 tries</span>
          </div>

          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
              const guess = opponentGuesses[rowIdx] || '';
              const isSubmitted = rowIdx < opponentGuesses.length;

              return (
                <div key={rowIdx} className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((colIdx) => {
                    const char = guess[colIdx] || '';
                    let bgColor = 'bg-transparent border border-[var(--surface-border)]';

                    if (isSubmitted) {
                      // Show color feedback without revealing opponent's exact letters
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
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg uppercase transition-all ${bgColor}`}
                      >
                        {isSubmitted ? '•' : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <span className="text-xs text-[var(--foreground-muted)] mt-2">
            Live opponent progress
          </span>
        </div>
      </div>
    </main>
  );
}
