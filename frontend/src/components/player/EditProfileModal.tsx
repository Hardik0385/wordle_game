'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PRESET_AVATARS, getDefaultAvatar } from '@/lib/avatars';
import { X, Check, Loader2, Sparkles, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const pathname = usePathname();
  const { user, profile, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [googleImgError, setGoogleImgError] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state with active profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setSelectedAvatar(profile.photoURL || '');
    }
    setGoogleImgError(false);
    setPreviewError(false);
  }, [profile, isOpen]);

  // Auto-close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user || !mounted) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(displayName, bio, selectedAvatar);
      onClose();
    } catch (err) {
      // handled in context
    } finally {
      setSaving(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setSelectedAvatar(getDefaultAvatar(randomSeed));
    setPreviewError(false);
  };

  const previewSrc = previewError || !selectedAvatar
    ? getDefaultAvatar(user.uid)
    : selectedAvatar;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--surface, #191d27)',
          borderColor: 'var(--surface-border, #262b38)',
        }}
        className="w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative text-[var(--foreground)] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2ec47d]/15 text-[#2ec47d]">
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Edit Profile</h2>
              <p className="text-xs text-[var(--foreground-muted)]">Customize your player persona and avatar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl hover:bg-[var(--surface-border)]/40 transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <img
                src={previewSrc}
                alt="Selected Avatar"
                referrerPolicy="no-referrer"
                onError={() => setPreviewError(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#2ec47d] shadow-lg object-cover bg-[var(--background)]"
              />
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                title="Generate Random Avatar"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#2ec47d] text-white shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Sparkles size={14} />
              </button>
            </div>
            <span className="text-[11px] font-bold text-[var(--foreground-muted)]">
              Click sparkles or choose below
            </span>
          </div>

          {/* Avatar Presets Gallery */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Avatar Gallery
            </span>
            <div
              style={{
                backgroundColor: 'var(--background, #12151c)',
                borderColor: 'var(--surface-border, #262b38)',
              }}
              className="grid grid-cols-6 gap-2 p-2.5 rounded-2xl border max-h-36 overflow-y-auto"
            >
              {/* Google Profile Photo option if available */}
              {user.photoURL && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(user.photoURL!);
                    setPreviewError(false);
                  }}
                  title="Use Google Photo"
                  className={`relative p-1 rounded-xl border-2 transition-all flex items-center justify-center bg-[var(--surface)] cursor-pointer overflow-hidden ${
                    selectedAvatar === user.photoURL
                      ? 'border-[#2ec47d] scale-105 shadow-sm'
                      : 'border-transparent hover:border-[var(--foreground-muted)]/40'
                  }`}
                >
                  {!googleImgError ? (
                    <img
                      src={user.photoURL}
                      alt="Google"
                      referrerPolicy="no-referrer"
                      onError={() => setGoogleImgError(true)}
                      className="w-full h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full h-10 rounded-lg flex flex-col items-center justify-center bg-white/10 text-[9px] font-bold">
                      <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.44 7.34 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.1z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.28 2.56 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"/>
                      </svg>
                      <span>Google</span>
                    </div>
                  )}
                  {selectedAvatar === user.photoURL && (
                    <div className="absolute inset-0 bg-[#2ec47d]/20 flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow" />
                    </div>
                  )}
                </button>
              )}

              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(av.url);
                    setPreviewError(false);
                  }}
                  title={av.name}
                  className={`relative p-1 rounded-xl border-2 transition-all bg-[var(--surface)] cursor-pointer overflow-hidden ${
                    selectedAvatar === av.url
                      ? 'border-[#2ec47d] scale-105 shadow-sm'
                      : 'border-transparent hover:border-[var(--foreground-muted)]/40'
                  }`}
                >
                  <img src={av.url} alt={av.name} className="w-full h-10 rounded-lg object-cover" />
                  {selectedAvatar === av.url && (
                    <div className="absolute inset-0 bg-[#2ec47d]/20 flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Player Name
            </label>
            <input
              type="text"
              maxLength={25}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your public username"
              style={{
                backgroundColor: 'var(--background, #12151c)',
                borderColor: 'var(--surface-border, #262b38)',
              }}
              className="py-2.5 px-3.5 rounded-2xl border focus:border-[#2ec47d] outline-none text-sm font-bold transition-colors"
            />
          </div>

          {/* Bio / Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Bio / Status
            </label>
            <input
              type="text"
              maxLength={60}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Wordle Grandmaster, Puzzle Enthusiast"
              style={{
                backgroundColor: 'var(--background, #12151c)',
                borderColor: 'var(--surface-border, #262b38)',
              }}
              className="py-2.5 px-3.5 rounded-2xl border focus:border-[#2ec47d] outline-none text-sm transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--surface-border)]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-[#2ec47d] hover:bg-[#26a86b] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-[#2ec47d]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

