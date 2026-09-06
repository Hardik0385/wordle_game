'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { getRandomWord } from '@/engine/word-validator';
import { 
  Swords, 
  Copy, 
  Check, 
  Users, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Timer,
  Wind,
  Settings2,
  Hash,
  RotateCcw,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

type SpecialDuelSubMode = 'timed' | 'chaos' | 'custom';

const CURSED_CANDIDATES = ['J', 'Q', 'X', 'Z', 'K', 'V', 'B', 'W', 'F', 'P'];

function DuelLobbyContent() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab: 'classic' or 'modes'
  const [activeTab, setActiveTab] = useState<'classic' | 'modes'>('classic');

  // Sub-mode in Mode Arena
  const [specialMode, setSpecialMode] = useState<SpecialDuelSubMode>('timed');

  // Custom Settings
  const [customWordLength, setCustomWordLength] = useState<number>(5);
  const [customMaxGuesses, setCustomMaxGuesses] = useState<number>(6);
  const [customHardMode, setCustomHardMode] = useState<boolean>(false);

  // Room State
  const [roomIdInput, setRoomIdInput] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomMeta, setCreatedRoomMeta] = useState<{
    modeType: string;
    wordLength: number;
    maxGuesses: number;
    isHardMode: boolean;
    cursedLetter?: string;
    timeLimit?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [waitingOpponent, setWaitingOpponent] = useState(false);

  // Synchronize tab from URL search parameters if passed
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'modes') {
      setActiveTab('modes');
    } else if (tabParam === 'classic') {
      setActiveTab('classic');
    }
  }, [searchParams]);

  // Listen to room status if host is waiting
  useEffect(() => {
    if (!createdRoomId) return;

    const unsubscribe = onSnapshot(doc(db, 'rooms', createdRoomId), (snapshot) => {
      const data = snapshot.data();
      if (data && data.player2Id) {
        toast.success(`${data.player2Name || 'Opponent'} joined! Starting duel...`);
        router.push(`/duel/${createdRoomId}`);
      }
    });

    return () => unsubscribe();
  }, [createdRoomId, router]);

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error('Please sign in first to create a 1v1 room!');
      return;
    }

    try {
      setCreating(true);
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      let modeType: string = 'classic';
      let wordLength = 5;
      let maxGuesses = 6;
      let isHardMode = false;
      let timeLimit: number | undefined = undefined;
      let cursedLetter: string | undefined = undefined;

      if (activeTab === 'classic') {
        modeType = 'classic';
        wordLength = 5;
        maxGuesses = 6;
      } else {
        if (specialMode === 'timed') {
          modeType = 'timed';
          wordLength = 5;
          maxGuesses = 6;
          timeLimit = 60; // 60 seconds blitz
        } else if (specialMode === 'chaos') {
          modeType = 'chaos';
          wordLength = 5;
          maxGuesses = 6;
        } else if (specialMode === 'custom') {
          modeType = 'custom';
          wordLength = customWordLength;
          maxGuesses = customMaxGuesses;
          isHardMode = customHardMode;
        }
      }

      let targetWord: string;
      try {
        targetWord = getRandomWord(wordLength).toUpperCase();
      } catch (e) {
        targetWord = 'CRANE';
      }

      // If chaos mode, pick a cursed letter not in targetWord
      if (modeType === 'chaos') {
        const available = CURSED_CANDIDATES.filter((c) => !targetWord.includes(c));
        cursedLetter = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : 'X';
      }

      const roomPayload: any = {
        roomId,
        targetWord,
        wordLength,
        maxGuesses,
        isHardMode,
        modeType,
        createdAt: serverTimestamp(),
        status: 'waiting',
        player1Id: user.uid,
        player1Name: user.displayName || 'Player 1',
        player1Photo: user.photoURL || null,
        player1Guesses: [],
        player1Solved: false,
        player2Id: null,
        player2Name: null,
        player2Photo: null,
        player2Guesses: [],
        player2Solved: false,
        winnerId: null,
      };

      if (timeLimit) roomPayload.timeLimit = timeLimit;
      if (cursedLetter) roomPayload.cursedLetter = cursedLetter;

      await setDoc(doc(db, 'rooms', roomId), roomPayload);

      setCreatedRoomId(roomId);
      setCreatedRoomMeta({ modeType, wordLength, maxGuesses, isHardMode, cursedLetter, timeLimit });
      setWaitingOpponent(true);
      toast.success('Room created! Share code with your opponent.');
    } catch (err: any) {
      console.error('Error creating room:', err);
      toast.error(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelRoom = async () => {
    if (createdRoomId) {
      try {
        await deleteDoc(doc(db, 'rooms', createdRoomId));
      } catch (e) {}
      setCreatedRoomId(null);
      setCreatedRoomMeta(null);
      setWaitingOpponent(false);
      toast.success('Room closed & cleaned');
    }
  };

  const handleJoinRoom = async () => {
    if (!user) {
      toast.error('Please sign in first to join a 1v1 room!');
      return;
    }

    const trimmed = roomIdInput.trim().toUpperCase();
    if (!trimmed) {
      toast.error('Please enter a room code');
      return;
    }

    try {
      setJoining(true);
      const roomRef = doc(db, 'rooms', trimmed);
      const snap = await getDoc(roomRef);

      if (!snap.exists()) {
        toast.error('Room not found! Check the code.');
        return;
      }

      const roomData = snap.data();
      if (roomData.player1Id === user.uid) {
        router.push(`/duel/${trimmed}`);
        return;
      }

      if (roomData.player2Id && roomData.player2Id !== user.uid) {
        toast.error('This room is already full!');
        return;
      }

      // Join room as Player 2 & mark match started
      await updateDoc(roomRef, {
        player2Id: user.uid,
        player2Name: user.displayName || 'Player 2',
        player2Photo: user.photoURL || null,
        status: 'playing',
        startedAt: serverTimestamp(),
      });

      toast.success('Joined room! Starting duel...');
      router.push(`/duel/${trimmed}`);
    } catch (err: any) {
      console.error('Error joining room:', err);
      toast.error(err.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const copyCode = () => {
    if (!createdRoomId) return;
    navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-8 items-center text-center">
      {/* Header Banner */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2ec47d] to-[#10b981] flex items-center justify-center text-white shadow-xl shadow-[#2ec47d]/30">
          <Swords size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tight">1V1 Word Duel</h1>
        <p className="text-[var(--foreground-muted)] max-w-md text-sm">
          Race online opponents in real-time. Choose between Classic Duel or Mode Arena battles!
        </p>
      </div>

      {!user ? (
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-8 flex flex-col items-center gap-4 max-w-md w-full shadow-sm">
          <Sparkles className="text-[#2ec47d]" size={32} />
          <h2 className="font-black text-xl">Sign In Required</h2>
          <p className="text-xs text-[var(--foreground-muted)]">
            You need to be signed in to host or join live multiplayer duels and track your ELO rating.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 px-4 rounded-2xl bg-[#2ec47d] hover:bg-[#26a86b] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-3xl">
          {/* Top Mode Cards Selection (Exactly 2 Online Modes) */}
          <div className="grid grid-cols-2 gap-3 self-center max-w-md w-full">
            <button
              onClick={() => setActiveTab('classic')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs transition-all cursor-pointer border ${
                activeTab === 'classic'
                  ? 'bg-[#2ec47d] text-white border-[#2ec47d] shadow-lg shadow-[#2ec47d]/20'
                  : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--surface-border)] hover:text-[var(--foreground)]'
              }`}
            >
              <Swords size={16} />
              <span>1V1 Classic</span>
            </button>
            <button
              onClick={() => setActiveTab('modes')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs transition-all cursor-pointer border ${
                activeTab === 'modes'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--surface-border)] hover:text-[var(--foreground)]'
              }`}
            >
              <Zap size={16} />
              <span>1V1 Mode Arena</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            {/* Left Card: Host Game (Customized for chosen mode) */}
            <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2ec47d]/15 text-[#2ec47d] flex items-center justify-center">
                {activeTab === 'classic' ? <Users size={24} /> : <Zap size={24} className="text-indigo-400" />}
              </div>

              <div>
                <h2 className="font-extrabold text-lg">
                  {activeTab === 'classic' ? 'Host Classic 1V1 Duel' : 'Host 1V1 Mode Arena'}
                </h2>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  {activeTab === 'classic'
                    ? 'Standard 5-letter word duel with 6 attempts.'
                    : 'Choose your special match modifier below.'}
                </p>
              </div>

              {/* Special Mode Sub-Selector (in Mode Arena) */}
              {activeTab === 'modes' && !waitingOpponent && (
                <div className="w-full flex flex-col gap-4 text-left">
                  {/* Mode Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSpecialMode('timed')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center cursor-pointer transition-all ${
                        specialMode === 'timed'
                          ? 'bg-red-500/15 border-red-500 text-red-400 font-black'
                          : 'bg-[var(--background)] border-[var(--surface-border)] text-[var(--foreground-muted)]'
                      }`}
                    >
                      <Timer size={18} />
                      <span className="text-[11px]">Timed 60s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpecialMode('chaos')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center cursor-pointer transition-all ${
                        specialMode === 'chaos'
                          ? 'bg-purple-500/15 border-purple-500 text-purple-400 font-black'
                          : 'bg-[var(--background)] border-[var(--surface-border)] text-[var(--foreground-muted)]'
                      }`}
                    >
                      <Wind size={18} />
                      <span className="text-[11px]">Chaos Rule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpecialMode('custom')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center cursor-pointer transition-all ${
                        specialMode === 'custom'
                          ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400 font-black'
                          : 'bg-[var(--background)] border-[var(--surface-border)] text-[var(--foreground-muted)]'
                      }`}
                    >
                      <Settings2 size={18} />
                      <span className="text-[11px]">Custom Length</span>
                    </button>
                  </div>

                  {/* Mode Explanation / Controls */}
                  {specialMode === 'timed' && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      ⚡ <strong>60-Second Blitz:</strong> Fast-paced countdown! Both players race against the 60s clock. First to solve or furthest progress wins!
                    </div>
                  )}

                  {specialMode === 'chaos' && (
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">
                      🌪️ <strong>Cursed Letter Modifier:</strong> A random cursed letter will be chosen when the match begins. Neither player can guess words containing it!
                    </div>
                  )}

                  {specialMode === 'custom' && (
                    <div className="w-full flex flex-col gap-3 p-3 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)]">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1 mb-1.5">
                          <Hash size={12} className="text-indigo-400" /> Word Length
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[4, 5, 6].map((len) => (
                            <button
                              key={len}
                              type="button"
                              onClick={() => setCustomWordLength(len)}
                              className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                customWordLength === len
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--surface-border)]'
                              }`}
                            >
                              {len} Letters
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1 mb-1.5">
                          <RotateCcw size={12} className="text-indigo-400" /> Max Attempts
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[5, 6, 7].map((tries) => (
                            <button
                              key={tries}
                              type="button"
                              onClick={() => setCustomMaxGuesses(tries)}
                              className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                customMaxGuesses === tries
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--surface-border)]'
                              }`}
                            >
                              {tries} Tries
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-border)]">
                        <span className="text-xs font-extrabold flex items-center gap-1 text-orange-400">
                          <Flame size={13} /> Hard Mode
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomHardMode(!customHardMode)}
                          className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer ${
                            customHardMode ? 'bg-orange-500' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              customHardMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Waiting Room Code Box */}
              {waitingOpponent && createdRoomId ? (
                <div className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--background)] border border-[#2ec47d]/40">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2ec47d]/15 text-[#2ec47d] uppercase tracking-wider">
                      {createdRoomMeta?.modeType?.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 uppercase tracking-wider">
                      {createdRoomMeta?.wordLength || 5} Letters
                    </span>
                    {createdRoomMeta?.cursedLetter && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 uppercase tracking-wider">
                        Cursed: {createdRoomMeta.cursedLetter}
                      </span>
                    )}
                    {createdRoomMeta?.timeLimit && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 uppercase tracking-wider">
                        60s Timer
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mt-1">
                    Room Code
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black tracking-widest text-[#2ec47d]">
                      {createdRoomId}
                    </span>
                    <button
                      onClick={copyCode}
                      className="p-2 rounded-xl bg-[var(--surface-border)]/40 hover:bg-[var(--surface-border)] transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={18} className="text-[#2ec47d]" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] animate-pulse mt-2">
                    <Loader2 size={14} className="animate-spin text-[#2ec47d]" />
                    <span>Waiting for opponent to join...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRoom}
                    className="mt-2 text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer transition-colors"
                  >
                    Cancel & Delete Room
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCreateRoom}
                  disabled={creating}
                  className={`mt-auto w-full py-3.5 px-4 rounded-2xl disabled:opacity-50 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    activeTab === 'modes'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                      : 'bg-[#2ec47d] hover:bg-[#26a86b] shadow-[#2ec47d]/20'
                  }`}
                >
                  {creating ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : activeTab === 'modes' ? (
                    <Zap size={18} />
                  ) : (
                    <Swords size={18} />
                  )}
                  <span>
                    {activeTab === 'classic'
                      ? 'Host Classic Duel'
                      : specialMode === 'timed'
                      ? 'Host 60s Timed Duel'
                      : specialMode === 'chaos'
                      ? 'Host Chaos Duel'
                      : `Host ${customWordLength}-Letter Duel`}
                  </span>
                </button>
              )}
            </div>

            {/* Right Card: Join Any Duel */}
            <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                <ArrowRight size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg">Join Any 1V1 Duel</h2>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Enter the 6-character room code from your friend to join their Classic or Special Mode match.
                </p>
              </div>

              <input
                type="text"
                maxLength={6}
                placeholder="ENTER CODE"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                className="w-full text-center tracking-widest uppercase font-black text-xl py-3 px-4 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] focus:border-blue-500 outline-none transition-colors"
              />

              <button
                onClick={handleJoinRoom}
                disabled={joining || !roomIdInput.trim()}
                className="mt-auto w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                {joining ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                <span>Join Duel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DuelLobbyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#2ec47d]" size={32} />
      </div>
    }>
      <DuelLobbyContent />
    </Suspense>
  );
}
