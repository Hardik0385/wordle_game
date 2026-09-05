'use client';

import Link from 'next/link';
import { useSettingsStore, ColorTheme, TileShape, LetterFont } from '@/store/settings-store';
import { ChevronLeft, Check } from 'lucide-react';
import { Tile } from '@/components/game/Tile';

const COLOR_THEMES: { id: ColorTheme; name: string; primary: string; secondary: string }[] = [
  { id: 'classic', name: 'High Contrast', primary: '#f97316', secondary: '#0284c7' },
  { id: 'forest', name: 'Forest', primary: '#2ec47d', secondary: '#d39e33' },
  { id: 'aurora', name: 'Aurora', primary: '#8b5cf6', secondary: '#f97316' },
  { id: 'sunset', name: 'Sunset', primary: '#ec4899', secondary: '#fb923c' },
  { id: 'ocean', name: 'Ocean', primary: '#06b6d4', secondary: '#3b82f6' },
  { id: 'candy', name: 'Candy', primary: '#d946ef', secondary: '#14b8a6' },
  { id: 'mono', name: 'Mono', primary: '#f8fafc', secondary: '#64748b' },
];

const TILE_SHAPES: { id: TileShape; name: string }[] = [
  { id: 'square', name: 'Square' },
  { id: 'rounded', name: 'Rounded' },
  { id: 'circle', name: 'Circle' },
];

const LETTER_FONTS: { id: LetterFont; name: string; fontClass: string }[] = [
  { id: 'fredoka', name: 'Fredoka', fontClass: 'font-fredoka' },
  { id: 'righteous', name: 'Righteous', fontClass: 'font-righteous' },
  { id: 'mono', name: 'Mono', fontClass: 'font-mono' },
  { id: 'heavy', name: 'Heavy', fontClass: 'font-heavy' },
];

export default function CustomizationPage() {
  const { 
    theme, 
    setTheme, 
    tileShape, 
    setTileShape, 
    letterFont, 
    setLetterFont 
  } = useSettingsStore();

  return (
    <main className="p-4 sm:p-8 max-w-xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link 
          href="/settings"
          className="h-10 w-10 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--background)] transition-colors"
        >
          <ChevronLeft size={20} className="text-[var(--foreground)]" />
        </Link>
        <h1 className="text-2xl font-black tracking-wide text-[var(--foreground)]">Customization</h1>
      </header>

      {/* Live Preview Card */}
      <div className="w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground-muted)]">
          LIVE PREVIEW
        </span>

        <div className="flex gap-2 justify-center">
          <Tile letter="G" state="correct" overrideShape={tileShape} overrideFont={letterFont} />
          <Tile letter="A" state="present" overrideShape={tileShape} overrideFont={letterFont} />
          <Tile letter="M" state="absent" overrideShape={tileShape} overrideFont={letterFont} />
          <Tile letter="E" state="correct" overrideShape={tileShape} overrideFont={letterFont} />
          <Tile letter="S" state="present" overrideShape={tileShape} overrideFont={letterFont} />
        </div>
      </div>

      {/* Color theme Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-black text-[var(--foreground)]">Color theme</h2>

        <div className="grid grid-cols-3 gap-3">
          {COLOR_THEMES.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-3xl bg-[var(--surface)] border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected 
                    ? 'border-[#2ec47d] shadow-lg shadow-[#2ec47d]/10' 
                    : 'border-[var(--surface-border)] hover:border-[#343b4f]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-[#2ec47d] flex items-center justify-center text-black">
                    <Check size={10} strokeWidth={4} />
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-2.5">
                  <span 
                    className="h-5 w-5 rounded-lg shadow-sm" 
                    style={{ backgroundColor: t.primary }} 
                  />
                  <span 
                    className="h-5 w-5 rounded-lg shadow-sm" 
                    style={{ backgroundColor: t.secondary }} 
                  />
                </div>

                <span className={`text-xs font-bold ${isSelected ? 'text-[var(--foreground)]' : 'text-[var(--foreground-muted)]'}`}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tile shape Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-black text-[var(--foreground)]">Tile shape</h2>

        <div className="grid grid-cols-3 gap-3">
          {TILE_SHAPES.map((s) => {
            const isSelected = tileShape === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setTileShape(s.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl bg-[var(--surface)] border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected 
                    ? 'border-[#2ec47d] shadow-lg shadow-[#2ec47d]/10' 
                    : 'border-[var(--surface-border)] hover:border-[#343b4f]'
                }`}
              >
                <div 
                  className={`h-8 w-8 bg-[#2ec47d] mb-2.5 ${
                    s.id === 'rounded' ? 'rounded-xl' : s.id === 'circle' ? 'rounded-full' : 'rounded-md'
                  }`}
                />
                <span className={`text-xs font-bold ${isSelected ? 'text-[#2ec47d]' : 'text-[var(--foreground-muted)]'}`}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Letter font Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-black text-[var(--foreground)]">Letter font</h2>

        <div className="grid grid-cols-4 gap-2.5">
          {LETTER_FONTS.map((f) => {
            const isSelected = letterFont === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setLetterFont(f.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl bg-[var(--surface)] border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected 
                    ? 'border-[#2ec47d] shadow-lg shadow-[#2ec47d]/10' 
                    : 'border-[var(--surface-border)] hover:border-[#343b4f]'
                }`}
              >
                <span className={`text-xl sm:text-2xl text-[var(--foreground)] mb-1.5 ${f.fontClass}`}>
                  Ag
                </span>
                <span className={`text-[11px] sm:text-xs font-bold ${isSelected ? 'text-[#2ec47d]' : 'text-[var(--foreground-muted)]'}`}>
                  {f.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
