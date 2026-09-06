import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { GameStats } from '@/store/player-store';

export async function syncGameResultToFirebase(
  won: boolean,
  attempts: number,
  fullStats?: GameStats,
  isDuel: boolean = false
) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    // Dynamic ELO system for all modes (Solo & Multiplayer):
    // 1-2 guesses: +30 ELO (genius tier)
    // 3-4 guesses: +25 ELO (strong solve)
    // 5-6 guesses: +15 ELO (standard solve)
    // Loss: -10 ELO (minimum rating protected at 100)
    let eloChange = -10;
    if (won) {
      if (attempts <= 2) eloChange = 30;
      else if (attempts <= 4) eloChange = 25;
      else eloChange = 15;
    }

    const updateData: any = {
      gamesPlayed: increment(1),
      gamesWon: increment(won ? 1 : 0),
      rating: increment(eloChange),
      lastPlayedAt: serverTimestamp(),
    };

    if (isDuel) {
      updateData.duelWins = increment(won ? 1 : 0);
      updateData.duelLosses = increment(won ? 0 : 1);
    }

    if (fullStats) {
      updateData.stats = fullStats;
    }

    await setDoc(userDocRef, updateData, { merge: true });
    return eloChange;
  } catch (error) {
    console.error('Error syncing game result to Firebase:', error);
    return 0;
  }
}
