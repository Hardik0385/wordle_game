import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './game-store';

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
});
