import words4 from '../data/words/4.json';
import words5 from '../data/words/5.json';
import words6 from '../data/words/6.json';
import { MULTILANG_WORDS } from '../data/words/multilang';

type WordDictionary = {
  answers: string[];
  allowed: string[];
};

const dictionaries: Record<number, WordDictionary> = {
  4: words4,
  5: words5,
  6: words6,
};

export function getDictionary(length: number, lang?: string): WordDictionary | undefined {
  if (lang && MULTILANG_WORDS[lang]?.[length]) {
    return MULTILANG_WORDS[lang][length];
  }
  return dictionaries[length];
}

/**
 * Checks if a word is valid (either an answer or an allowed guess).
 */
export function isValidWord(word: string, lang?: string): boolean {
  const length = word.length;
  const dict = getDictionary(length, lang);
  if (!dict) return false;

  const upperWord = word.toUpperCase();
  return dict.answers.includes(upperWord) || dict.allowed.includes(upperWord);
}

/**
 * Returns a random target word for a given length.
 */
export function getRandomWord(length: number, lang?: string): string {
  const dict = getDictionary(length, lang);
  if (!dict || dict.answers.length === 0) {
    const fallback = dictionaries[length];
    if (!fallback) throw new Error(`No dictionary available for length ${length}`);
    return fallback.answers[Math.floor(Math.random() * fallback.answers.length)];
  }

  const randomIndex = Math.floor(Math.random() * dict.answers.length);
  return dict.answers[randomIndex];
}

/**
 * Generates a deterministic daily word based on the date.
 */
export function getDailyWord(length: number, dateString: string, lang?: string): string {
  const dict = getDictionary(length, lang) || dictionaries[length];
  if (!dict || dict.answers.length === 0) {
    throw new Error(`No dictionary available for length ${length}`);
  }

  // Simple deterministic hash based on date string (e.g. "2026-09-06")
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0; 
  }
  
  const index = Math.abs(hash) % dict.answers.length;
  return dict.answers[index];
}

import { evaluateGuess } from './guess-evaluator';

/**
 * Validates a guess against Hard Mode rules.
 * Returns an error message if invalid, or null if valid.
 */
export function validateHardMode(currentGuess: string, lastGuess: string, targetWord: string): string | null {
  if (!lastGuess) return null;

  const evaluated = evaluateGuess(lastGuess, targetWord);
  
  // Track required letters (presents + correct)
  const requiredCounts: Record<string, number> = {};
  
  // First, verify all 'correct' letters are in the exact same position
  for (let i = 0; i < evaluated.length; i++) {
    const { letter, state } = evaluated[i];
    if (state === 'correct') {
      if (currentGuess[i] !== letter) {
        return `1st letter must be ${letter}`; // simplified, we can say "Xth letter must be Y"
      }
      requiredCounts[letter] = (requiredCounts[letter] || 0) + 1;
    } else if (state === 'present') {
      requiredCounts[letter] = (requiredCounts[letter] || 0) + 1;
    }
  }

  // Now, verify all required letters are in the current guess
  const currentCounts: Record<string, number> = {};
  for (const char of currentGuess) {
    currentCounts[char] = (currentCounts[char] || 0) + 1;
  }

  for (const [char, count] of Object.entries(requiredCounts)) {
    if (!currentCounts[char] || currentCounts[char] < count) {
      return `Guess must contain ${char}`;
    }
  }

  // Fix the "1st letter must be X" string to use proper ordinal
  for (let i = 0; i < evaluated.length; i++) {
    if (evaluated[i].state === 'correct' && currentGuess[i] !== evaluated[i].letter) {
      const ordinal = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i+1}th`;
      return `${ordinal} letter must be ${evaluated[i].letter}`;
    }
  }

  return null;
}
