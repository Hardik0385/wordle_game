import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settings-store';
import { getTranslation } from '../lib/translations';
import { isValidWord, getRandomWord } from '../engine/word-validator';

describe('settings-store and multi-language / accessibility features', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      gameLanguage: 'English (US)',
      interfaceLanguage: 'English',
      colorblindMode: false,
      animationSpeed: 'normal',
      appearance: 'dark',
    });
  });

  it('allows changing interface language and updates translations', () => {
    const store = useSettingsStore.getState();
    store.setInterfaceLanguage('Español');
    expect(useSettingsStore.getState().interfaceLanguage).toBe('Español');
    expect(getTranslation('Español', 'play')).toBe('Jugar');
    expect(getTranslation('Español', 'settings_title')).toBe('Ajustes');

    store.setInterfaceLanguage('Français');
    expect(getTranslation('Français', 'play')).toBe('Jouer');

    store.setInterfaceLanguage('Deutsch');
    expect(getTranslation('Deutsch', 'play')).toBe('Spielen');
  });

  it('allows changing game language and retrieves words in that language', () => {
    const store = useSettingsStore.getState();
    store.setGameLanguage('Español');
    expect(useSettingsStore.getState().gameLanguage).toBe('Español');

    expect(isValidWord('PLAYA', 'Español')).toBe(true);
    expect(isValidWord('MUNDO', 'Español')).toBe(true);
    const spanishWord = getRandomWord(5, 'Español');
    expect(spanishWord).toBeDefined();
    expect(spanishWord.length).toBe(5);
  });

  it('toggles colorblind mode', () => {
    expect(useSettingsStore.getState().colorblindMode).toBe(false);
    useSettingsStore.getState().toggleColorblindMode();
    expect(useSettingsStore.getState().colorblindMode).toBe(true);
  });

  it('updates animation speed between normal, fast, and off', () => {
    const store = useSettingsStore.getState();
    store.setAnimationSpeed('fast');
    expect(useSettingsStore.getState().animationSpeed).toBe('fast');
    store.setAnimationSpeed('off');
    expect(useSettingsStore.getState().animationSpeed).toBe('off');
  });
});
