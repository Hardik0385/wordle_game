'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Play, Calendar, LayoutGrid, BarChart2, Award, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Play', href: '/play', icon: Play },
  { name: 'Daily', href: '/daily', icon: Calendar },
  { name: 'Modes', href: '/modes', icon: LayoutGrid },
  { name: 'Stats', href: '/stats', icon: BarChart2 },
  { name: 'Awards', href: '/achievements', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col w-64 h-screen border-r dark:border-gray-800 p-4 sticky top-0">
        <div className="mb-8 font-extrabold tracking-widest text-2xl text-center">WORDLY</div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold",
                  isActive ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation (Bottom bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t dark:border-gray-800 bg-white dark:bg-gray-900 z-50 flex justify-around p-2 pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-xs font-semibold",
                isActive ? "text-black dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
              )}
            >
              <Icon size={24} />
              <span className="hidden sm:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
