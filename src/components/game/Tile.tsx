import { EvaluatedLetter } from '@/engine/guess-evaluator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TileProps {
  letter?: string;
  state?: EvaluatedLetter['state'];
  isCurrent?: boolean;
  fogged?: boolean;
}

export function Tile({ letter, state, isCurrent, fogged }: TileProps) {
  // Determine if we should animate the flip. We animate if it has a resolved state.
  const isEvaluated = !!state;

  return (
    <motion.div
      initial={false}
      animate={isEvaluated ? { rotateX: [0, 90, 0] } : {}}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center border-2 text-2xl font-bold uppercase transition-colors duration-300",
        {
          "border-[var(--tile-border-empty)] bg-[var(--tile-bg-empty)] text-black dark:text-white": !state && !isCurrent && !letter,
          "border-gray-400 dark:border-gray-500 bg-[var(--tile-bg-empty)] text-black dark:text-white scale-105": !state && isCurrent && letter,
          "border-slate-400 bg-slate-300/40 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400": fogged && state,
          "border-[var(--tile-border-absent)] bg-[var(--tile-bg-absent)] text-black dark:text-white": !fogged && state === 'absent',
          "border-[var(--tile-bg-present)] bg-[var(--tile-bg-present)] text-white": !fogged && state === 'present',
          "border-[var(--tile-bg-correct)] bg-[var(--tile-bg-correct)] text-white": !fogged && state === 'correct',
        }
      )}
    >
      {letter}
    </motion.div>
  );
}
