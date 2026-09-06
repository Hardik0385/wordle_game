'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Swords, Copy, Check, Users, ArrowRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SAMPLE_WORDS = ['CRANE', 'GHOST', 'PLANT', 'LIGHT', 'BRAVE', 'SHINE', 'STORM', 'CANDY', 'WATER', 'PRIDE'];

export default function DuelLobbyPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [roomIdInput, setRoomIdInput] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
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
      const targetWord = SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)];

      await setDoc(doc(db, 'rooms', roomId), {
        roomId,
        targetWord,
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
      });

      setCreatedRoomId(roomId);
      setWaitingOpponent(true);
      toast.success('Room created! Share the code with a friend.');
    } catch (err: any) {
      console.error('Error creating room:', err);
      toast.error(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
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
    <main className="p-4 sm:p-8 max-w-3xl mx-auto flex flex-col gap-8 items-center text-center">
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
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Create Room Card */}
          <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#2ec47d]/15 text-[#2ec47d] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Create a Match</h2>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Generate a unique room code and send it to your opponent.
              </p>
            </div>

            {waitingOpponent && createdRoomId ? (
              <div className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--background)] border border-[#2ec47d]/40">
                <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                  Room Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-widest text-[#2ec47d]">
                    {createdRoomId}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-xl bg-[var(--surface-border)]/40 hover:bg-[var(--surface-border)] transition-colors"
                  >
                    {copied ? <Check size={18} className="text-[#2ec47d]" /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] animate-pulse mt-2">
                  <Loader2 size={14} className="animate-spin text-[#2ec47d]" />
                  <span>Waiting for opponent to join...</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCreateRoom}
                disabled={creating}
                className="mt-auto w-full py-3 px-4 rounded-2xl bg-[#2ec47d] hover:bg-[#26a86b] disabled:opacity-50 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#2ec47d]/20"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : <Swords size={18} />}
                <span>Host Game</span>
              </button>
            )}
          </div>

          {/* Join Room Card */}
          <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <ArrowRight size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Join a Match</h2>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Enter the 6-character room code from your friend.
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
              className="mt-auto w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
            >
              {joining ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              <span>Join Duel</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
