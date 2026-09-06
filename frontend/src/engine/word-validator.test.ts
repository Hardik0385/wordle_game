import { describe, it, expect } from 'vitest';
import { isValidWord, getRandomWord, getDailyWord, validateHardMode } from './word-validator';

describe('Word Validator', () => {
  it('validates 4-letter words', () => {
    expect(isValidWord('WORD')).toBe(true);
    expect(isValidWord('GAME')).toBe(true);
    expect(isValidWord('ZZZZ')).toBe(false);
  });

  it('validates 5-letter words', () => {
    expect(isValidWord('CRANE')).toBe(true);
    expect(isValidWord('TREES')).toBe(true);
    expect(isValidWord('ABCDE')).toBe(false);
  });

  it('validates 6-letter words', () => {
    expect(isValidWord('PUZZLE')).toBe(true);
    expect(isValidWord('CODING')).toBe(true);
    expect(isValidWord('XXXXXX')).toBe(false);
  });

  it('generates random words of different lengths', () => {
    const word4 = getRandomWord(4);
    const word5 = getRandomWord(5);
    const word6 = getRandomWord(6);

    expect(word4).toHaveLength(4);
    expect(word5).toHaveLength(5);
    expect(word6).toHaveLength(6);
  });

  it('generates deterministic daily words for a given date', () => {
    const word1 = getDailyWord(5, '2026-09-06');
    const word2 = getDailyWord(5, '2026-09-06');
    const nextDay = getDailyWord(5, '2026-09-07');

    expect(word1).toBe(word2);
    expect(word1).toHaveLength(5);
  });

  it('enforces hard mode rules', () => {
    // If target is APPLE and guess is AROMA
    // Evaluated: A is correct at 0. Next guess must start with A.
    const err = validateHardMode('CRANE', 'AROMA', 'APPLE');
    expect(err).toBe('1st letter must be A');

    // Valid follow-up with A at 0
    const validErr = validateHardMode('APPLY', 'AROMA', 'APPLE');
    expect(validErr).toBeNull();
  });
});
