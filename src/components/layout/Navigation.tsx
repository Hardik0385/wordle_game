'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BarChart2, Calendar, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settings-store';
import { getTranslation } from '@/lib/translations';

const navItems = [
  { key: 'play', href: '/play', icon: LayoutGrid },
  { key: 'stats', href: '/stats', icon: BarChart2 },
  { key: 'daily', href: '/daily', icon: Calendar },
  { key: 'awards', href: '/achievements', icon: Trophy },
  { key: 'settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const interfaceLanguage = useSettingsStore(state => state.interfaceLanguage);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col w-64 h-screen border-r border-[var(--surface-border)] bg-[var(--surface)] p-4 sticky top-0 transition-colors">
        <Link href="/" className="mb-8 font-black tracking-widest text-2xl text-center text-[var(--foreground)] hover:opacity-90">
          WORDLY
        </Link>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'));
            const label = getTranslation(interfaceLanguage, item.key);
            return (
              <Link 
                key={item.key} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm",
                  isActive 
                    ? "bg-[#2ec47d]/15 text-[#2ec47d] border border-[#2ec47d]/30 shadow-sm" 
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                )}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--surface-border)] bg-[var(--surface)]/95 backdrop-blur-lg z-50 flex justify-around p-2 pb-safe transition-colors">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'));
          const label = getTranslation(interfaceLanguage, item.key);
          return (
            <Link 
              key={item.key} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-[11px] font-bold",
                isActive 
                  ? "text-[#2ec47d]" 
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={22} className={isActive ? "text-[#2ec47d]" : ""} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
