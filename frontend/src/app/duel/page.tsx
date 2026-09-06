'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Hash,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DuelLobbyPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Mode Selection: 'classic' or 'custom'
  const [activeTab, setActiveTab] = useState<'classic' | 'custom'>('classic');

  // Custom Mode Parameters
  const [customWordLength, setCustomWordLength] = useState<number>(5);
  const [customMaxGuesses, setCustomMaxGuesses] = useState<number>(6);
  const [customHardMode, setCustomHardMode] = useState<boolean>(false);

  // Room State
  const [roomIdInput, setRoomIdInput] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomMeta, setCreatedRoomMeta] = useState<{
    wordLength: number;
    maxGuesses: number;
    isHardMode: boolean;
    modeType: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [waitingOpponent, setWaitingOpponent] = useState(false);

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
      // Generate 6-char random alphanumeric room code
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const isCustom = activeTab === 'custom';
      const wordLength = isCustom ? customWordLength : 5;
      const maxGuesses = isCustom ? customMaxGuesses : 6;
      const isHardMode = isCustom ? customHardMode : false;
      const modeType = isCustom ? 'custom' : 'classic';

      let targetWord: string;
      try {
        targetWord = getRandomWord(wordLength).toUpperCase();
      } catch (err) {
        targetWord = 'CRANE';
      }

      const roomPayload = {
        roomId,
        targetWord,
        wordLength,
        maxGuesses,
        isHardMode,
        modeType,
        createdAt: serverTimestamp(),
        status: 'waiting', // waiting, playing, finished
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

      await setDoc(doc(db, 'rooms', roomId), roomPayload);

      setCreatedRoomId(roomId);
      setCreatedRoomMeta({ wordLength, maxGuesses, isHardMode, modeType });
      setWaitingOpponent(true);
      toast.success('Room created! Share the code with your opponent.');
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
        // Rejoining own room
        router.push(`/duel/${trimmed}`);
        return;
      }

      if (roomData.player2Id && roomData.player2Id !== user.uid) {
        toast.error('This room is already full!');
        return;
      }

      // Join room as Player 2
      await updateDoc(roomRef, {
        player2Id: user.uid,
        player2Name: user.displayName || 'Player 2',
        player2Photo: user.photoURL || null,
        status: 'playing',
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
          Challenge friends in real-time. Both solve the same secret word simultaneously. First to solve wins!
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
          {/* Mode Selector Tabs */}
          <div className="flex p-1.5 bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl self-center max-w-md w-full">
            <button
              onClick={() => setActiveTab('classic')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeTab === 'classic'
                  ? 'bg-[#2ec47d] text-white shadow-md shadow-[#2ec47d]/20'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Swords size={16} />
              <span>Classic 1V1</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Custom 1V1</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            {/* Host / Create Room Card */}
            <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2ec47d]/15 text-[#2ec47d] flex items-center justify-center">
                <Users size={24} />
              </div>

              <div>
                <h2 className="font-extrabold text-lg">
                  {activeTab === 'classic' ? 'Host Classic 1V1' : 'Host Custom 1V1'}
                </h2>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  {activeTab === 'classic'
                    ? 'Standard 5-letter word duel with 6 attempts.'
                    : 'Customize word length, attempts, and difficulty rules.'}
                </p>
              </div>

              {/* Custom Options Panel */}
              {activeTab === 'custom' && !waitingOpponent && (
                <div className="w-full flex flex-col gap-4 text-left bg-[var(--background)] p-4 rounded-2xl border border-[var(--surface-border)]">
                  {/* Word Length */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5 mb-2">
                      <Hash size={13} className="text-indigo-400" /> Word Length
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[4, 5, 6].map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setCustomWordLength(len)}
                          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                            customWordLength === len
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--surface-border)] hover:border-indigo-500/50'
                          }`}
                        >
                          {len} Letters
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Guesses */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5 mb-2">
                      <RotateCcw size={13} className="text-indigo-400" /> Max Attempts
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 6, 7].map((tries) => (
                        <button
                          key={tries}
                          type="button"
                          onClick={() => setCustomMaxGuesses(tries)}
                          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                            customMaxGuesses === tries
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--surface-border)] hover:border-indigo-500/50'
                          }`}
                        >
                          {tries} Tries
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hard Mode Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-border)]">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold flex items-center gap-1.5">
                        <Flame size={14} className={customHardMode ? 'text-orange-500' : 'text-zinc-500'} />
                        Hard Mode
                      </span>
                      <span className="text-[10px] text-[var(--foreground-muted)]">
                        Revealed hints must be reused
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomHardMode(!customHardMode)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        customHardMode ? 'bg-orange-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          customHardMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting Room Code Box */}
              {waitingOpponent && createdRoomId ? (
                <div className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--background)] border border-[#2ec47d]/40">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2ec47d]/15 text-[#2ec47d] uppercase tracking-wider">
                      {createdRoomMeta?.wordLength || 5} Letters
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 uppercase tracking-wider">
                      {createdRoomMeta?.maxGuesses || 6} Attempts
                    </span>
                    {createdRoomMeta?.isHardMode && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 uppercase tracking-wider">
                        Hard Mode
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
                    activeTab === 'custom'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                      : 'bg-[#2ec47d] hover:bg-[#26a86b] shadow-[#2ec47d]/20'
                  }`}
                >
                  {creating ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : activeTab === 'custom' ? (
                    <SlidersHorizontal size={18} />
                  ) : (
                    <Swords size={18} />
                  )}
                  <span>
                    {activeTab === 'classic'
                      ? 'Host Classic Match'
                      : `Host ${customWordLength}-Letter Match`}
                  </span>
                </button>
              )}
            </div>

            {/* Join Room Card */}
            <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                <ArrowRight size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg">Join Any Duel</h2>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Enter the 6-character room code from your friend (works for both Classic and Custom matches).
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
