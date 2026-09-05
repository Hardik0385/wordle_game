import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorTheme = 'forest' | 'aurora' | 'sunset' | 'ocean' | 'candy' | 'mono' | 'classic';
export type TileShape = 'rounded' | 'square' | 'circle';
export type LetterFont = 'fredoka' | 'righteous' | 'mono' | 'heavy';
export type AppearanceMode = 'dark' | 'light' | 'system';

interface SettingsState {
  theme: ColorTheme;
  tileShape: TileShape;
  letterFont: LetterFont;
  appearance: AppearanceMode;
  colorblindMode: boolean;
  hardMode: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showTimer: boolean;
  animationSpeed: 'normal' | 'fast' | 'off';
  wordLength: number;
  gameLanguage: string;
  interfaceLanguage: string;
  
  // Actions
  setTheme: (theme: ColorTheme) => void;
  setTileShape: (shape: TileShape) => void;
  setLetterFont: (font: LetterFont) => void;
  setAppearance: (mode: AppearanceMode) => void;
  toggleColorblindMode: () => void;
  toggleHardMode: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleShowTimer: () => void;
  setAnimationSpeed: (speed: 'normal' | 'fast' | 'off') => void;
  setWordLength: (length: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'forest', // Default to the sleek Forest theme from screenshot
      tileShape: 'rounded',
      letterFont: 'fredoka',
      appearance: 'dark',
      colorblindMode: false,
      hardMode: false,
      soundEnabled: true,
      hapticsEnabled: true,
      showTimer: false,
      animationSpeed: 'normal',
      wordLength: 5,
      gameLanguage: 'English (US)',
      interfaceLanguage: 'English',
      
      setTheme: (theme) => set({ theme }),
      setTileShape: (tileShape) => set({ tileShape }),
      setLetterFont: (letterFont) => set({ letterFont }),
      setAppearance: (appearance) => set({ appearance }),
      toggleColorblindMode: () => set((state) => ({ colorblindMode: !state.colorblindMode })),
      toggleHardMode: () => set((state) => ({ hardMode: !state.hardMode })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      toggleShowTimer: () => set((state) => ({ showTimer: !state.showTimer })),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      setWordLength: (wordLength) => set({ wordLength }),
    }),
    {
      name: 'wordly-settings-storage',
    }
  )
);
