'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, Loader2, Trophy } from 'lucide-react';
import Image from 'next/image';

export function AuthButton() {
  const { user, profile, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 rounded-2xl bg-[var(--surface-border)]/20 animate-pulse">
        <Loader2 className="animate-spin text-[#2ec47d]" size={20} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col gap-2 p-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--background)]/50">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-10 h-10 rounded-full border border-[#2ec47d]/40 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2ec47d] to-[#10b981] flex items-center justify-center font-bold text-white shadow-sm">
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm text-[var(--foreground)] truncate">
              {user.displayName || 'Player'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#2ec47d] font-semibold">
              <Trophy size={12} />
              <span>{profile?.rating ?? 1200} ELO</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-1 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-xs transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2ec47d] to-[#10b981] hover:brightness-105 active:scale-[0.98] text-white font-extrabold text-sm shadow-md shadow-[#2ec47d]/20 transition-all cursor-pointer"
    >
      <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.44 7.34 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.28 2.56 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
        />
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}
