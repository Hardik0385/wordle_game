# WORDLY — Full-Stack Real-Time Word Puzzle & 1v1 Duel Game

A modern, responsive full-stack Wordle application built with Next.js, React, Tailwind CSS, Zustand, and Firebase (Authentication, Firestore Realtime Database).

## Architecture

The project is structured into two standalone directories:

```
wordle/
├── frontend/             # Next.js 16 (App Router) client application
│   ├── src/
│   │   ├── app/          # App router pages (play, modes, daily, duel, stats)
│   │   ├── components/   # Game boards, layout, auth & leaderboard UI
│   │   ├── context/      # Firebase AuthContext (Google OAuth & profile sync)
│   │   ├── engine/       # Wordle evaluation and validation engine
│   │   └── store/        # Zustand state stores (game, player, settings)
│   └── .env.local        # Firebase web credentials (git-ignored)
│
├── backend/              # Firebase backend foundation
│   ├── firestore.rules   # Security rules for Users, Leaderboards & 1v1 Rooms
│   ├── package.json      # Node.js backend dependencies (firebase-admin)
│   └── src/index.js      # Firebase Admin SDK entry point
│
└── .gitignore            # Root gitignore protecting all secrets and builds
```

## Features

- **Google OAuth Login**: Sign in with Google to sync stats, track ELO ratings, and participate in online battles.
- **Global Leaderboard**: Live Firestore stream ranking top players globally by ELO rating and win rates.
- **1V1 Multiplayer Duels**: Real-time head-to-head word race. Both players guess the same word simultaneously with live opponent progress.
- **Game Modes**: Classic, Daily Challenge, Timed Rush, Survival Gauntlet, Endless Climber, Chaos Mode, and Custom games.

## Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Create a `frontend/.env.local` file (see `frontend/.env.example`) with your Firebase project keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 2. Backend Security Rules
Deploy or paste `backend/firestore.rules` into the Firebase Console (Firestore Database -> Rules tab).
