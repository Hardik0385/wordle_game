'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (theme === 'classic') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  }, [theme, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return <>{children}</>;
}
