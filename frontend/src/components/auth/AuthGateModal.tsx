'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AuthGateModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // All routes except the landing home page '/' require authentication
  const isProtected = pathname !== '/';

  if (!isProtected || !mounted) return null;

  if (loading) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xl">
        <div
          style={{
            backgroundColor: 'var(--surface, #191d27)',
            borderColor: 'var(--surface-border, #262b38)',
          }}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl border shadow-2xl"
        >
          <Loader2 className="animate-spin text-[#2ec47d]" size={32} />
          <span className="text-xs font-bold text-[var(--foreground-muted)]">Checking player session...</span>
        </div>
      </div>,
      document.body
    );
  }

  if (!user) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
        <div
          style={{
            backgroundColor: 'var(--surface, #191d27)',
            borderColor: 'var(--surface-border, #262b38)',
          }}
          className="border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
        >
          
          {/* Glow Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#2ec47d]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2ec47d] to-[#10b981] flex items-center justify-center text-white shadow-xl shadow-[#2ec47d]/30 mb-4">
            <Lock size={28} />
          </div>

          <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">
            Sign In Required
          </h2>
          <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mb-6 max-w-xs leading-relaxed">
            Sign in with Google to access game modes, customize settings, track cloud stats, view awards, and compete in online 1v1 duels.
          </p>

          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-[#2ec47d] hover:bg-[#26a86b] active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-[#2ec47d]/25 transition-all cursor-pointer mb-3"
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

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>,
      document.body
    );
  }

  return null;
}
