import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './game-store';
import { usePlayerStore } from './player-store';

describe('game-store timer and guess mechanics', () => {
  beforeEach(() => {
    useGameStore.getState().setGameMode('classic');
  });

  it('classic mode should not start timerRunning on guess submission', () => {
    const store = useGameStore.getState();
    store.addLetter('C');
    store.addLetter('R');
    store.addLetter('A');
    store.addLetter('N');
    store.addLetter('E');
    store.submitGuess();

    const stateAfter = useGameStore.getState();
    expect(stateAfter.gameMode).toBe('classic');
    expect(stateAfter.timerRunning).toBe(false);
  });

  it('tickTimer in classic mode should count elapsed time and never cause game loss', () => {
    const store = useGameStore.getState();
    expect(store.status).toBe('playing');

    // Simulate 70 seconds passing
    for (let i = 0; i < 70; i++) {
      useGameStore.getState().tickTimer();
    }

    const stateAfter = useGameStore.getState();
    expect(stateAfter.status).toBe('playing');
    expect(stateAfter.elapsedSeconds).toBe(70);
  });

  it('tickTimer in timed mode counts down and triggers loss when timer expires', () => {
    useGameStore.getState().setGameMode('timed');
    const store = useGameStore.getState();
    expect(store.timerRunning).toBe(true);

    // Simulate running down the 60s timer
    for (let i = 0; i < 65; i++) {
      useGameStore.getState().tickTimer();
    }

    const stateAfter = useGameStore.getState();
    expect(stateAfter.status).toBe('lost');
    expect(stateAfter.timerSeconds).toBe(0);
  });

  it('useHint reveals a letter with its exact position and decrements hintsRemaining', () => {
    const store = useGameStore.getState();
    store.resetGame('CRANE');

    expect(useGameStore.getState().hintsRemaining).toBe(2);
    expect(useGameStore.getState().hints).toHaveLength(0);

    useGameStore.getState().useHint();

    const state1 = useGameStore.getState();
    expect(state1.hintsRemaining).toBe(1);
    expect(state1.hints).toHaveLength(1);
    const hint1 = state1.hints[0];
    expect(hint1.index).toBeGreaterThanOrEqual(0);
    expect(hint1.index).toBeLessThan(5);
    expect('CRANE'[hint1.index]).toBe(hint1.letter);
    expect(state1.error).toContain(`Letter at position ${hint1.index + 1} is '${hint1.letter}'`);

    // Use second hint
    useGameStore.getState().useHint();
    const state2 = useGameStore.getState();
    expect(state2.hintsRemaining).toBe(0);
    expect(state2.hints).toHaveLength(2);
    const hint2 = state2.hints[1];
    expect(hint2.index).not.toBe(hint1.index);
    expect('CRANE'[hint2.index]).toBe(hint2.letter);

    // Attempting third hint should error and not decrement
    useGameStore.getState().useHint();
    const state3 = useGameStore.getState();
    expect(state3.hintsRemaining).toBe(0);
    expect(state3.hints).toHaveLength(2);
    expect(state3.error).toContain('No hints left');
  });

  it('preserves in-progress classic game when switching to survival and switching back', () => {
    const store = useGameStore.getState();
    store.resetGame('CRANE');
    store.addLetter('S');
    store.addLetter('L');
    store.addLetter('ALate'.slice(2, 3)); // 'A'
    store.addLetter('T');
    store.addLetter('E');
    store.submitGuess(); // 'SLATE' submitted

    expect(useGameStore.getState().guesses).toEqual(['SLATE']);
    expect(useGameStore.getState().targetWord).toBe('CRANE');

    // Switch to survival mode
    useGameStore.getState().setGameMode('survival');
    expect(useGameStore.getState().gameMode).toBe('survival');
    expect(useGameStore.getState().guesses).toEqual([]);

    // Switch back to classic mode
    useGameStore.getState().setGameMode('classic');
    expect(useGameStore.getState().gameMode).toBe('classic');
    expect(useGameStore.getState().targetWord).toBe('CRANE');
    expect(useGameStore.getState().guesses).toEqual(['SLATE']);
  });

  it('forfeits an active timed game when switching modes and counts it in player stats', () => {
    const initialGames = usePlayerStore.getState().stats.gamesPlayed;

    // Start timed mode and simulate timer ticking down / guess
    useGameStore.getState().setGameMode('timed');
    useGameStore.getState().tickTimer(); // timerSeconds becomes 59

    expect(useGameStore.getState().timerSeconds).toBe(59);

    // Switch away from timed mode to classic
    useGameStore.getState().setGameMode('classic');

    // Timed game should have been forfeited and counted in player stats
    const afterGames = usePlayerStore.getState().stats.gamesPlayed;
    expect(afterGames).toBe(initialGames + 1);
  });
});
