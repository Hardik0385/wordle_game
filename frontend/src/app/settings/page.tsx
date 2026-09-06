'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/settings-store';
import { usePlayerStore } from '@/store/player-store';
import { useGameStore } from '@/store/game-store';
import { sounds } from '@/lib/sound';
import { 
  ShieldAlert, 
  HelpCircle, 
  Type, 
  Smartphone, 
  Volume2, 
  Clock, 
  Moon, 
  Palette, 
  Eye, 
  Gauge, 
  Languages, 
  Globe, 
  ChevronRight,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTranslation } from '@/lib/translations';

export default function SettingsPage() {
  const { 
    hardMode, 
    toggleHardMode, 
    wordLength, 
    setWordLength, 
    hapticsEnabled, 
    toggleHaptics, 
    soundEnabled, 
    toggleSound, 
    showTimer, 
    toggleShowTimer,
    appearance,
    setAppearance,
    theme,
    colorblindMode,
    toggleColorblindMode,
    animationSpeed,
    setAnimationSpeed,
    gameLanguage,
    setGameLanguage,
    interfaceLanguage,
    setInterfaceLanguage
  } = useSettingsStore();

  const { name, setName } = usePlayerStore();
  const [showHardModeInfo, setShowHardModeInfo] = useState(false);

  // 1. Hard Mode Handler
  const handleHardModeToggle = () => {
    toggleHardMode();
    const next = !hardMode;
    if (next) {
      toast.success('Hard Mode enabled! All hints must be used.');
    } else {
      toast('Hard Mode disabled');
    }
  };

  // 2. Word Length Handler
  const handleWordLengthChange = (length: number) => {
    setWordLength(length);
    const gameState = useGameStore.getState();
    if (gameState.status === 'playing' && gameState.guesses.length > 0) {
      toast.success(`Word length set to ${length} letters! Will apply to your next game.`);
    } else {
      gameState.resetGame(undefined, undefined, length);
      toast.success(`Word length set to ${length} letters!`);
    }
  };

  // 3. Haptics Handler
  const handleHapticsToggle = () => {
    toggleHaptics();
    const next = !hapticsEnabled;
    if (next) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 40, 20]);
      }
      toast.success('Haptics enabled');
    } else {
      toast('Haptics disabled');
    }
  };

  // 4. Sounds Handler
  const handleSoundsToggle = () => {
    toggleSound();
    const next = !soundEnabled;
    if (next) {
      sounds.playKeyClick();
      toast.success('Sound effects enabled');
    } else {
      toast('Sound effects disabled');
    }
  };

  // 5. Show Timer Handler
  const handleShowTimerToggle = () => {
    toggleShowTimer();
    const next = !showTimer;
    if (next) {
      toast.success('Live timer enabled in all games');
    } else {
      toast('Live timer disabled');
    }
  };

  // 6. Colorblind Mode Handler
  const handleColorblindToggle = () => {
    toggleColorblindMode();
    const next = !colorblindMode;
    if (next) {
      toast.success('High-contrast colorblind mode enabled');
    } else {
      toast('Standard colors restored');
    }
  };

  // 7. Appearance Mode Handler
  const handleAppearanceChange = (mode: 'dark' | 'light') => {
    setAppearance(mode);
    toast.success(`Appearance set to ${mode} mode`);
  };

  // 8. Animation Speed Handler
  const handleAnimationSpeedChange = (speed: 'normal' | 'fast' | 'off') => {
    setAnimationSpeed(speed);
    toast.success(`Animation speed set to ${speed}`);
  };

  return (
    <main className="p-4 sm:p-8 max-w-xl mx-auto flex flex-col gap-6 select-none pb-24">
      <header>
        <h1 className="text-3xl font-black text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'settings_title')}</h1>
      </header>

      {/* Profile Name Card */}
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-5 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase">Player Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            className="text-base font-black bg-transparent text-[var(--foreground)] border-b border-gray-500/30 focus:border-[#2ec47d] focus:outline-none py-1"
          />
        </div>
        <span className="text-2xl">👋</span>
      </div>

      {/* GAMEPLAY SECTION */}
      <section className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground-muted)] px-1">
          {getTranslation(interfaceLanguage, 'gameplay')}
        </span>

        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl divide-y divide-[var(--surface-border)] overflow-hidden shadow-sm">
          {/* Hard Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <ShieldAlert size={18} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'hard_mode')}</span>
                <button 
                  type="button" 
                  onClick={() => setShowHardModeInfo(!showHardModeInfo)}
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            </div>

            {/* iOS Switch */}
            <button
              type="button"
              onClick={handleHardModeToggle}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                hardMode ? 'bg-[#2ec47d]' : 'bg-gray-400/40'
              }`}
            >
              <div 
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  hardMode ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
          </div>

          {showHardModeInfo && (
            <div className="p-4 text-xs text-[var(--foreground-muted)] bg-[var(--background)]">
              {getTranslation(interfaceLanguage, 'hard_mode_desc')}
            </div>
          )}

          {/* Word Length */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Type size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'word_length')}</span>
            </div>

            <select
              value={wordLength}
              onChange={(e) => handleWordLengthChange(Number(e.target.value))}
              className="bg-[var(--background)] text-[var(--foreground)] text-xs font-bold px-3 py-2 rounded-xl border border-[var(--surface-border)] focus:outline-none cursor-pointer"
            >
              <option value={4}>4 {getTranslation(interfaceLanguage, 'letters')}</option>
              <option value={5}>5 {getTranslation(interfaceLanguage, 'letters')}</option>
              <option value={6}>6 {getTranslation(interfaceLanguage, 'letters')}</option>
            </select>
          </div>

          {/* Haptics */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Smartphone size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'haptics')}</span>
            </div>

            <button
              type="button"
              onClick={handleHapticsToggle}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                hapticsEnabled ? 'bg-[#2ec47d]' : 'bg-gray-400/40'
              }`}
            >
              <div 
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
          </div>

          {/* Sounds */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Volume2 size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'sounds')}</span>
            </div>

            <button
              type="button"
              onClick={handleSoundsToggle}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-[#2ec47d]' : 'bg-gray-400/40'
              }`}
            >
              <div 
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
          </div>

          {/* Show Timer */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Clock size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'show_timer')}</span>
            </div>

            <button
              type="button"
              onClick={handleShowTimerToggle}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                showTimer ? 'bg-[#2ec47d]' : 'bg-gray-400/40'
              }`}
            >
              <div 
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  showTimer ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
          </div>
        </div>
      </section>

      {/* APPEARANCE SECTION */}
      <section className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground-muted)] px-1">
          {getTranslation(interfaceLanguage, 'appearance')}
        </span>

        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl divide-y divide-[var(--surface-border)] overflow-hidden shadow-sm">
          {/* Customization / Theme Studio Link (Image 1 entry) */}
          <Link
            href="/settings/customization"
            className="p-4 flex items-center justify-between hover:opacity-90 transition-opacity group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#2ec47d]/15 text-[#2ec47d] border border-[#2ec47d]/30 flex items-center justify-center">
                <Palette size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'customization')}</span>
                <span className="text-xs text-[var(--foreground-muted)]">{getTranslation(interfaceLanguage, 'customize_themes')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold capitalize text-[#2ec47d]">
                {theme}
              </span>
              <ChevronRight size={16} className="text-[var(--foreground-muted)] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Light / Dark Mode Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Moon size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'dark_mode')}</span>
            </div>

            <select
              value={appearance}
              onChange={(e) => handleAppearanceChange(e.target.value as any)}
              className="bg-[var(--background)] text-[var(--foreground)] text-xs font-bold px-3 py-2 rounded-xl border border-[var(--surface-border)] focus:outline-none cursor-pointer capitalize"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Colorblind Mode */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                  <Eye size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'colorblind_mode')}</span>
                  <p className="text-xs text-[var(--foreground-muted)]">{getTranslation(interfaceLanguage, 'colorblind_desc')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleColorblindToggle}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                  colorblindMode ? 'bg-[#f97316]' : 'bg-gray-400/40'
                }`}
              >
                <div 
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    colorblindMode ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            {/* Live Colorblind Mode Preview */}
            <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[var(--foreground-muted)]">Live Tile Colors:</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shadow-sm ${colorblindMode ? 'bg-[#f97316]' : 'bg-[#2ec47d]'}`}>
                    ✓
                  </div>
                  <span className="font-bold text-[var(--foreground)] text-[11px]">{colorblindMode ? 'Orange (Correct)' : 'Green (Correct)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shadow-sm ${colorblindMode ? 'bg-[#0284c7]' : 'bg-[#d39e33]'}`}>
                    ●
                  </div>
                  <span className="font-bold text-[var(--foreground)] text-[11px]">{colorblindMode ? 'Blue (Present)' : 'Yellow (Present)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Speed */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Gauge size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'animation_speed')}</span>
            </div>

            <select
              value={animationSpeed}
              onChange={(e) => handleAnimationSpeedChange(e.target.value as any)}
              className="bg-[var(--background)] text-[var(--foreground)] text-xs font-bold px-3 py-2 rounded-xl border border-[var(--surface-border)] focus:outline-none cursor-pointer capitalize"
            >
              <option value="normal">{getTranslation(interfaceLanguage, 'speed_normal')}</option>
              <option value="fast">{getTranslation(interfaceLanguage, 'speed_fast')}</option>
              <option value="off">{getTranslation(interfaceLanguage, 'speed_off')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* LANGUAGE SECTION */}
      <section className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground-muted)] px-1">
          {getTranslation(interfaceLanguage, 'language_section')}
        </span>

        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl divide-y divide-[var(--surface-border)] overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Languages size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'game_language')}</span>
            </div>
            <select
              value={gameLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setGameLanguage(lang);
                const gameState = useGameStore.getState();
                if (gameState.status === 'playing' && gameState.guesses.length > 0) {
                  toast.success(`Game language set to ${lang}! Will apply to your next game.`);
                } else {
                  gameState.resetGame();
                  toast.success(`Game language set to ${lang}`);
                }
              }}
              className="bg-[var(--background)] text-[var(--foreground)] text-xs font-bold px-3 py-2 rounded-xl border border-[var(--surface-border)] focus:outline-none cursor-pointer"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Español">Español</option>
              <option value="Français">Français</option>
              <option value="Deutsch">Deutsch</option>
            </select>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--background)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--foreground)]">
                <Globe size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)]">{getTranslation(interfaceLanguage, 'interface_language')}</span>
            </div>
            <select
              value={interfaceLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setInterfaceLanguage(lang);
                toast.success(`Interface language set to ${lang}`);
              }}
              className="bg-[var(--background)] text-[var(--foreground)] text-xs font-bold px-3 py-2 rounded-xl border border-[var(--surface-border)] focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Español">Español</option>
              <option value="Français">Français</option>
              <option value="Deutsch">Deutsch</option>
            </select>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <div className="pt-2">
        <button 
          onClick={() => {
            if (confirm("Reset all local game and player data?")) {
              localStorage.removeItem('wordly-player-storage');
              localStorage.removeItem('wordly-game-storage');
              localStorage.removeItem('wordly-settings-storage');
              window.location.reload();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/20 transition-colors"
        >
          <Trash2 size={16} /> {getTranslation(interfaceLanguage, 'reset_data')}
        </button>
      </div>
    </main>
  );
}
