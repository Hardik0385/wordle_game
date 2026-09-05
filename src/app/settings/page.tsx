'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { usePlayerStore } from '@/store/player-store';

const THEMES = [
  { id: 'classic', name: 'Classic' },
  { id: 'midnight', name: 'Midnight' },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useSettingsStore();
  const { name, setName } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme with document element
  useEffect(() => {
    if (mounted) {
      if (theme === 'classic') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  }, [theme, mounted]);

  if (!mounted) return <div className="p-8">Loading settings...</div>;

  return (
    <main className="p-4 sm:p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-extrabold mb-2">Settings</h1>
      </header>

      <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b pb-2 dark:border-gray-700">Profile</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Display Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          />
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b pb-2 dark:border-gray-700">Appearance</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Theme</label>
          <div className="flex gap-4 flex-wrap">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-4 py-3 rounded-lg font-bold transition-all ${theme === t.id ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b pb-2 dark:border-gray-700">Gameplay</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">Hard Mode</div>
            <div className="text-sm text-gray-500">Any revealed hints must be used in subsequent guesses</div>
          </div>
          <button 
            onClick={useSettingsStore.getState().toggleHardMode}
            className={`w-12 h-6 rounded-full transition-colors relative ${useSettingsStore.getState().hardMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${useSettingsStore.getState().hardMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="font-bold">Sound Effects</div>
            <div className="text-sm text-gray-500">Play sounds for tile reveals and game over</div>
          </div>
          <button 
            onClick={useSettingsStore.getState().toggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative ${useSettingsStore.getState().soundEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${useSettingsStore.getState().soundEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col gap-4 mt-8 border border-red-100 dark:border-red-900/50">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        <button 
          onClick={() => {
            if(confirm("Are you sure you want to delete all progress? This cannot be undone.")) {
              localStorage.removeItem('wordly-player-storage');
              localStorage.removeItem('wordly-game-storage');
              window.location.reload();
            }
          }}
          className="px-4 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors w-fit"
        >
          Reset All Data
        </button>
      </section>
    </main>
  );
}
