import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';

export async function syncGameResultToFirebase(won: boolean, attempts: number) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    // Calculate ELO change: +25 for win, -10 for loss (minimum 100)
    const eloChange = won ? 25 : -10;

    await setDoc(
      userDocRef,
      {
        gamesPlayed: increment(1),
        gamesWon: increment(won ? 1 : 0),
        rating: increment(eloChange),
        lastPlayedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing game result to Firebase:', error);
  }
}
