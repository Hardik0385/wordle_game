'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, tileShape, letterFont, appearance, colorblindMode, animationSpeed } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;

      // Color theme
      root.setAttribute('data-theme', theme);

      // Tile shape
      root.setAttribute('data-shape', tileShape);

      // Letter font
      root.setAttribute('data-font', letterFont);

      // Colorblind Mode
      root.setAttribute('data-colorblind', String(colorblindMode));

      // Animation speed
      root.setAttribute('data-animation', animationSpeed);

      // Appearance (light vs dark)
      root.setAttribute('data-appearance', appearance);
      if (appearance === 'light') {
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
      }
    }
  }, [theme, tileShape, letterFont, appearance, colorblindMode, animationSpeed, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return <>{children}</>;
}
