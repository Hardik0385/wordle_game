'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PRESET_AVATARS, getDefaultAvatar } from '@/lib/avatars';
import { X, Check, Loader2, Sparkles, User, Image as ImageIcon, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, profile, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setSelectedAvatar(profile.photoURL || '');
    }
  }, [profile, isOpen]);

  if (!isOpen || !user) return null;

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
      // error handled in context
    } finally {
      setSaving(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setSelectedAvatar(getDefaultAvatar(randomSeed));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2ec47d]/15 text-[#2ec47d]">
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black">Edit Profile</h2>
              <p className="text-xs text-[var(--foreground-muted)]">Customize your player persona and avatar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--surface-border)]/40 transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={selectedAvatar || getDefaultAvatar(user.uid)}
                alt="Selected Avatar"
                className="w-24 h-24 rounded-full border-3 border-[#2ec47d] shadow-lg object-cover bg-[var(--background)]"
              />
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                title="Generate Random Avatar"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#2ec47d] text-white shadow-md hover:scale-110 active:scale-95 transition-transform"
              >
                <Sparkles size={14} />
              </button>
            </div>
            <span className="text-xs font-bold text-[var(--foreground-muted)]">Choose or Randomize Avatar</span>
          </div>

          {/* Avatar Presets Gallery */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Avatar Gallery
            </span>
            <div className="grid grid-cols-6 gap-2.5 p-3 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] max-h-36 overflow-y-auto">
              {/* Google Profile Photo option if available */}
              {user.photoURL && (
                <button
                  type="button"
                  onClick={() => setSelectedAvatar(user.photoURL!)}
                  title="Use Google Photo"
                  className={`relative p-1 rounded-xl border-2 transition-all overflow-hidden ${
                    selectedAvatar === user.photoURL
                      ? 'border-[#2ec47d] scale-105 shadow-sm'
                      : 'border-transparent hover:border-[var(--foreground-muted)]/40'
                  }`}
                >
                  <img
                    src={user.photoURL}
                    alt="Google Account"
                    className="w-full h-10 rounded-lg object-cover"
                  />
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
                  onClick={() => setSelectedAvatar(av.url)}
                  title={av.name}
                  className={`relative p-1 rounded-xl border-2 transition-all bg-[var(--surface)] ${
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Player Name
            </label>
            <input
              type="text"
              maxLength={25}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your public username"
              className="py-2.5 px-3.5 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] focus:border-[#2ec47d] outline-none text-sm font-bold transition-colors"
            />
          </div>

          {/* Bio / Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Bio / Status
            </label>
            <input
              type="text"
              maxLength={60}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Wordle Grandmaster, Puzzle Enthusiast"
              className="py-2.5 px-3.5 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] focus:border-[#2ec47d] outline-none text-sm transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--surface-border)]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
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
}
