'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AccountActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'reset' | 'delete';
}

export function AccountActionModal({ isOpen, onClose, type }: AccountActionModalProps) {
  const router = useRouter();
  const { resetAccountStats, deleteAccount } = useAuth();
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setConfirmInput('');
    setLoading(false);
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen || !mounted) return null;

  const isDelete = type === 'delete';
  const isDeleteConfirmed = !isDelete || confirmInput.trim().toUpperCase() === 'DELETE';

  const handleConfirm = async () => {
    if (!isDeleteConfirmed || loading) return;

    try {
      setLoading(true);
      if (isDelete) {
        await deleteAccount();
        onClose();
        router.push('/');
      } else {
        await resetAccountStats();
        onClose();
      }
    } catch (err) {
      // error handled in context toasts
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      onClick={() => {
        if (!loading) onClose();
      }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--surface, #191d27)',
          borderColor: isDelete ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)',
        }}
        className="w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative text-[var(--foreground)] animate-in zoom-in-95 duration-200"
      >
        {/* Glow Accent */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isDelete ? 'bg-red-500/20' : 'bg-amber-500/20'
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isDelete ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {isDelete ? <Trash2 size={24} /> : <RefreshCw size={24} />}
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">
                {isDelete ? 'Delete Account' : 'Reset Statistics'}
              </h2>
              <span className="text-xs text-[var(--foreground-muted)]">
                {isDelete ? 'Irreversible Action' : 'Reset gameplay numbers'}
              </span>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--surface-border)]/40 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Warning Message */}
        <div
          style={{
            backgroundColor: 'var(--background, #12151c)',
            borderColor: 'var(--surface-border, #262b38)',
          }}
          className="p-4 rounded-2xl border flex flex-col gap-2 text-xs leading-relaxed"
        >
          {isDelete ? (
            <>
              <div className="flex items-center gap-1.5 font-black text-red-400">
                <AlertTriangle size={14} />
                <span>Warning: This cannot be undone!</span>
              </div>
              <p className="text-[var(--foreground-muted)]">
                Deleting your account will permanently wipe your profile, custom avatar, cloud stats, rating (ELO), and match records from the cloud.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 font-black text-amber-400">
                <RefreshCw size={14} />
                <span>What will happen:</span>
              </div>
              <p className="text-[var(--foreground-muted)]">
                Your games played, wins, win streaks, and guess distribution will reset to 0. Your rating will reset to 1200 ELO. Your username, custom avatar, and login will be preserved.
              </p>
            </>
          )}
        </div>

        {/* Confirmation Input for Delete */}
        {isDelete && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--foreground-muted)]">
              To confirm, type <span className="text-red-400 font-mono font-black">DELETE</span> below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              disabled={loading}
              style={{
                backgroundColor: 'var(--background, #12151c)',
                borderColor: 'var(--surface-border, #262b38)',
              }}
              className="py-2.5 px-3.5 rounded-2xl border focus:border-red-500 outline-none text-sm font-bold tracking-widest text-center transition-colors"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl border border-[var(--surface-border)] hover:bg-[var(--surface-border)]/40 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isDeleteConfirmed || loading}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md ${
              isDelete
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isDelete ? (
              <Trash2 size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{isDelete ? 'Permanently Delete' : 'Confirm Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
