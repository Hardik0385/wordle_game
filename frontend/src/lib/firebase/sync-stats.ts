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
    // Calculate ELO change: +25 for win, -10 for loss (minimum 100)
    const eloChange = won ? 25 : -10;

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
  } catch (error) {
    console.error('Error syncing game result to Firebase:', error);
  }
}
