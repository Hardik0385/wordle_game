import { describe, it, expect } from 'vitest';
import { evaluateGuess } from './guess-evaluator';

describe('evaluateGuess', () => {
  it('should correctly evaluate an exact match', () => {
    const result = evaluateGuess('APPLE', 'APPLE');
    expect(result.map(r => r.state)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('should correctly evaluate all absent letters', () => {
    const result = evaluateGuess('GHOST', 'APPLE');
    expect(result.map(r => r.state)).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  it('should correctly evaluate present letters in wrong positions', () => {
    const result = evaluateGuess('PEARL', 'APPLE');
    // P -> correct (0th P in PEARL matches P in aPple? No, A is 0, P is 1. Wait.
    // Target: APPLE (A, P, P, L, E)
    // Guess : PEARL (P, E, A, R, L)
    // P at index 0: 'present'
    // E at index 1: 'present'
    // A at index 2: 'present'
    // R at index 3: 'absent'
    // L at index 4: 'present' (Wait, L in PEARL is at 4, L in APPLE is at 3, so 'present'. Wait, no, L in PEARL is 4, E in APPLE is 4. 'present')
    expect(result.map(r => r.state)).toEqual(['present', 'present', 'present', 'absent', 'present']);
  });

  it('should handle duplicate letters accurately (1)', () => {
    // Target: APPLE (P appears twice)
    // Guess: ALLEY (L appears twice)
    // A: correct
    // L: target has one L. Guess has two Ls. First L is wrong position? Wait.
    // Target ALLEY vs APPLE? No, Target is APPLE, guess is ALLEY.
    // Guess: A (correct), L (present), L (absent), E (present), Y (absent)? 
    // Target: A P P L E
    // Guess:  A L L E Y
    // A: correct
    // L: present (target has one L, which is not correctly placed here)
    // L: absent (target has no more Ls)
    // E: present (wrong pos)
    // Y: absent
    const result = evaluateGuess('ALLEY', 'APPLE');
    expect(result.map(r => r.state)).toEqual(['correct', 'present', 'absent', 'present', 'absent']);
  });

  it('should handle duplicate letters accurately (2)', () => {
    // Target: APPLE (P appears twice)
    // Guess: PUPPY (P appears three times)
    // P (index 0): present (Target has P at 1 and 2. Guess has U at 1, P at 2. So P at 2 is correct. Target has 1 P left.)
    // U: absent
    // P (index 2): correct
    // P (index 3): absent (target has 2 Ps, one matched at index 2. The other matched at index 0 (present). No more Ps left.)
    // Y: absent
    const result = evaluateGuess('PUPPY', 'APPLE');
    expect(result.map(r => r.state)).toEqual(['present', 'absent', 'correct', 'absent', 'absent']);
  });

  it('throws an error if lengths differ', () => {
    expect(() => evaluateGuess('APP', 'APPLE')).toThrow();
  });
});
