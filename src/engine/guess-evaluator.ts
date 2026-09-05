export type LetterState = 'correct' | 'present' | 'absent' | 'unknown';

export interface EvaluatedLetter {
  letter: string;
  state: LetterState;
}

/**
 * Evaluates a guess against a target word, accurately handling duplicate letters.
 * Standard Wordle rules apply:
 * - 'correct' (green) if letter matches exact position.
 * - 'present' (yellow) if letter is in the word but wrong position, 
 *   up to the number of remaining unmatched occurrences in the target.
 * - 'absent' (gray) otherwise.
 */
export function evaluateGuess(guess: string, target: string): EvaluatedLetter[] {
  const guessUpper = guess.toUpperCase();
  const targetUpper = target.toUpperCase();
  
  if (guessUpper.length !== targetUpper.length) {
    throw new Error('Guess and target must be of the same length');
  }

  const length = guessUpper.length;
  const result: EvaluatedLetter[] = Array(length).fill(null).map((_, i) => ({
    letter: guessUpper[i],
    state: 'absent' // Default to absent
  }));

  const targetLetterCounts: Record<string, number> = {};

  // First pass: identify 'correct' matches and count remaining letters
  for (let i = 0; i < length; i++) {
    const targetChar = targetUpper[i];
    const guessChar = guessUpper[i];

    if (targetChar === guessChar) {
      result[i].state = 'correct';
    } else {
      targetLetterCounts[targetChar] = (targetLetterCounts[targetChar] || 0) + 1;
    }
  }

  // Second pass: identify 'present' matches
  for (let i = 0; i < length; i++) {
    const guessChar = guessUpper[i];
    
    // If it's not already correct, see if it should be present
    if (result[i].state !== 'correct') {
      if (targetLetterCounts[guessChar] > 0) {
        result[i].state = 'present';
        targetLetterCounts[guessChar] -= 1;
      }
    }
  }

  return result;
}
