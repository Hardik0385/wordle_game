'use client';

import { EvaluatedLetter } from '@/engine/guess-evaluator';
import { useSettingsStore } from '@/store/settings-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TileProps {
  letter?: string;
  state?: EvaluatedLetter['state'];
  isCurrent?: boolean;
  fogged?: boolean;
  overrideShape?: 'rounded' | 'square' | 'circle';
  overrideFont?: 'fredoka' | 'righteous' | 'mono' | 'heavy';
}

export function Tile({ letter, state, isCurrent, fogged, overrideShape, overrideFont }: TileProps) {
  const { tileShape: storeShape, letterFont: storeFont } = useSettingsStore();

  const shape = overrideShape || storeShape;
  const font = overrideFont || storeFont;
  const isEvaluated = !!state;

  return (
    <motion.div
      initial={false}
      animate={isEvaluated ? { rotateX: [0, 90, 0] } : {}}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center border-2 text-2xl font-bold uppercase transition-all duration-300 select-none",
        // Shape
        {
          "rounded-2xl": shape === 'rounded',
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
          // Empty tile (both inactive or waiting for letter)
          "border-[var(--tile-border-empty)] bg-[var(--tile-bg-empty)] text-[var(--foreground)]": !state && !letter,
          // Typing active letter tile
          "border-[#818384] bg-[var(--tile-bg-empty)] text-[var(--foreground)] scale-105 shadow-sm": !state && !!letter,
          // Fogged in chaos mode
          "border-slate-500 bg-[var(--tile-bg-absent)] text-[var(--tile-text-absent)] opacity-70": fogged && state,
          // Absent (greyed out)
          "border-[var(--tile-border-absent)] bg-[var(--tile-bg-absent)] text-[var(--tile-text-absent)]": !fogged && state === 'absent',
          // Present (theme present color, e.g. gold / orange / teal)
          "border-[var(--tile-bg-present)] bg-[var(--tile-bg-present)] text-[var(--tile-text-present)] shadow-md": !fogged && state === 'present',
          // Correct (theme correct color, e.g. emerald / purple / pink)
          "border-[var(--tile-bg-correct)] bg-[var(--tile-bg-correct)] text-[var(--tile-text-correct)] shadow-md": !fogged && state === 'correct',
        }
      )}
    >
      {letter}
    </motion.div>
  );
}
