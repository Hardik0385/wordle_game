'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BarChart2, Calendar, Trophy, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Play', href: '/play', icon: LayoutGrid },
  { name: 'Stats', href: '/stats', icon: BarChart2 },
  { name: 'Daily', href: '/daily', icon: Calendar },
  { name: 'Awards', href: '/achievements', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col w-64 h-screen border-r border-[#262b38] bg-[#161922] p-4 sticky top-0">
        <Link href="/" className="mb-8 font-black tracking-widest text-2xl text-center text-white hover:opacity-90">
          WORDLY
        </Link>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm",
                  isActive 
                    ? "bg-[#2ec47d]/15 text-[#2ec47d] border border-[#2ec47d]/30 shadow-sm" 
                    : "text-[#8e95a5] hover:text-white hover:bg-[#1f2432]"
                )}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation (Bottom bar matching Image 2) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#262b38] bg-[#12151c]/95 backdrop-blur-lg z-50 flex justify-around p-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'));
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-[11px] font-bold",
                isActive 
                  ? "text-[#2ec47d]" 
                  : "text-[#8e95a5] hover:text-white"
              )}
            >
              <Icon size={22} className={isActive ? "text-[#2ec47d]" : ""} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
