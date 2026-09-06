'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Loader2, Trophy, Edit3 } from 'lucide-react';
import { EditProfileModal } from '@/components/player/EditProfileModal';
import { getDefaultAvatar } from '@/lib/avatars';

export function AuthButton() {
  const { user, profile, loading, signInWithGoogle, logout } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 rounded-2xl bg-[var(--surface-border)]/20 animate-pulse">
        <Loader2 className="animate-spin text-[#2ec47d]" size={20} />
      </div>
    );
  }

  if (user) {
    const avatarSrc = profile?.photoURL || user.photoURL || getDefaultAvatar(user.uid);
    const displayName = profile?.displayName || user.displayName || 'Player';

    return (
      <>
        <div className="flex flex-col gap-2.5 p-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--background)]/50">
          <div 
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Click to edit profile & avatar"
          >
            <div className="relative">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-10 h-10 rounded-full border-2 border-[#2ec47d]/60 object-cover bg-[var(--surface)]"
              />
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#2ec47d] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={10} />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-sm text-[var(--foreground)] truncate group-hover:text-[#2ec47d] transition-colors">
                {displayName}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#2ec47d] font-semibold">
                <Trophy size={12} />
                <span>{profile?.rating ?? 1200} ELO</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--surface-border)]/50">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[var(--surface-border)]/40 hover:bg-[var(--surface-border)] font-bold text-xs transition-colors cursor-pointer"
            >
              <Edit3 size={12} />
              Edit
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>

        <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      </>
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
