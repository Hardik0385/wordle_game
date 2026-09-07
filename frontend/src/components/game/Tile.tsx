'use client';

import { EvaluatedLetter } from '@/engine/guess-evaluator';
import { useSettingsStore } from '@/store/settings-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TileProps {
  letter?: string;
  state?: EvaluatedLetter['state'];
  isCurrent?: boolean;
  isHint?: boolean;
  fogged?: boolean;
  overrideShape?: 'rounded' | 'square' | 'circle';
  overrideFont?: 'fredoka' | 'righteous' | 'mono' | 'heavy';
}

export function Tile({ letter, state, isCurrent, isHint, fogged, overrideShape, overrideFont }: TileProps) {
  const { tileShape: storeShape, letterFont: storeFont, colorblindMode, animationSpeed } = useSettingsStore();

  const shape = overrideShape || storeShape;
  const font = overrideFont || storeFont;
  const isEvaluated = !!state;

  const duration = animationSpeed === 'off' ? 0 : animationSpeed === 'fast' ? 0.15 : 0.5;

  return (
    <motion.div
      initial={false}
      animate={isEvaluated && animationSpeed !== 'off' ? { rotateX: [0, 90, 0] } : {}}
      transition={{ duration, ease: "easeInOut" }}
      className={cn(
        "relative flex h-[min(2.85rem,6.4vh)] w-[min(2.85rem,6.4vh)] sm:h-[min(3.25rem,7vh)] sm:w-[min(3.25rem,7vh)] md:h-[min(3.5rem,7.5vh)] md:w-[min(3.5rem,7.5vh)] items-center justify-center border-2 text-lg sm:text-2xl font-black uppercase select-none shrink-0",
        animationSpeed !== 'off' ? (animationSpeed === 'fast' ? "transition-all duration-150" : "transition-all duration-300") : "transition-none",
        // Shape
        {
          "rounded-xl sm:rounded-2xl": shape === 'rounded',
          "rounded-md": shape === 'square',
          "rounded-full": shape === 'circle',
        },
        // Font
        {
          "font-fredoka": font === 'fredoka',
          "font-righteous": font === 'righteous',
          "font-mono": font === 'mono',
          "font-heavy": font === 'heavy',
        },
        // State coloring
        {
          // Hint placeholder tile (revealed letter at correct position, awaiting user input)
          "border-dashed border-amber-500/80 bg-amber-500/10 text-amber-500 dark:text-amber-300 font-black shadow-sm": !state && isHint,
          // Empty tile (both inactive or waiting for letter)
          "border-[var(--tile-border-empty)] bg-[var(--tile-bg-empty)] text-[var(--foreground)]": !state && !letter && !isHint,
          // Typing active letter tile
          "border-[#818384] bg-[var(--tile-bg-empty)] text-[var(--foreground)] scale-105 shadow-sm": !state && !!letter && !isHint,
          // Fogged in chaos mode
          "border-slate-500 bg-[var(--tile-bg-absent)] text-[var(--tile-text-absent)] opacity-70": fogged && state,
          // Absent (greyed out)
          "border-[var(--tile-border-absent)] bg-[var(--tile-bg-absent)] text-[var(--tile-text-absent)]": !fogged && state === 'absent',
          // Present (Colorblind high-contrast blue vs theme present color)
          "border-[#0284c7] bg-[#0284c7] text-white shadow-md": !fogged && state === 'present' && colorblindMode,
          "border-[var(--tile-bg-present)] bg-[var(--tile-bg-present)] text-[var(--tile-text-present)] shadow-md": !fogged && state === 'present' && !colorblindMode,
          // Correct (Colorblind high-contrast orange vs theme correct color)
          "border-[#f97316] bg-[#f97316] text-white shadow-md": !fogged && state === 'correct' && colorblindMode,
          "border-[var(--tile-bg-correct)] bg-[var(--tile-bg-correct)] text-[var(--tile-text-correct)] shadow-md": !fogged && state === 'correct' && !colorblindMode,
        }
      )}
    >
      {letter}
      {isHint && !state && (
        <span className="absolute top-0.5 right-1 text-[8px] select-none leading-none opacity-80">💡</span>
      )}
      {colorblindMode && !fogged && state === 'correct' && (
        <span className="absolute top-1 right-1 text-[9px] font-black text-white/90 leading-none select-none">✓</span>
      )}
      {colorblindMode && !fogged && state === 'present' && (
        <span className="absolute top-1 right-1 text-[8px] font-black text-white/90 leading-none select-none">●</span>
      )}
    </motion.div>
  );
}
