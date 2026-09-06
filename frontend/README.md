# 🟩 WORDLY — A Personalized Word Puzzle Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green?logo=vitest)](https://vitest.dev/)

**WORDLY** is a modern, high-performance word puzzle platform inspired by Wordle, built from the ground up with responsive design, state-of-the-art animations, multiple game modes, multi-length word dictionaries, progression tracking, and customizable challenge rules.

---

## ✨ Features & Game Modes

### 🎮 8 Distinct Game Modes
1. **🎲 Classic Wordle**: The authentic Wordle experience with standard 5-letter words and 6 attempts.
2. **📅 Daily Challenge**: One deterministic puzzle per day seeded by the calendar date — identical for players worldwide.
3. **⏱️ Timed Rush**: A 60-second speed challenge with a live animated countdown bar, urgency pulsing states, and bonus XP for fast answers.
4. **🔥 Survival Gauntlet**: Start with 3 lives (❤️❤️❤️). Keep solving continuous words to build your ultimate streak. Miss a word and lose a heart!
5. **📈 Endless Climber**: Progressive ladder climbing from 4-letter words to 6-letter words, with attempt limits tightening down to 4 guesses.
6. **🌪️ Chaos Mode**: Dynamic modifier system with game twists:
   - **Fog of War**: Tile hints disappear after 3 seconds, forcing you to rely on memory.
   - **Speed Trap**: 35-second blitz timer.
   - **Cursed Letter**: Random common letter strictly forbidden for the round.
   - **Vowel Lock**: Every guess must contain at least 2 vowels.
   - **Sudden Death**: Only 4 attempts to guess the word.
7. **⚙️ Custom Game & Versus Challenge**:
   - Choose word lengths: **4, 5, or 6 letters**.
   - Customize attempt counts from 4 to 8.
   - Input a secret word to generate an encoded shareable link (`/play?mode=custom&challenge=...`) to challenge friends!
8. **♾️ Unlimited Practice**: Free-play mode featuring an on-screen "Skip / New Word" button with zero streak pressure.

---

### 🧠 Core Engine & Gameplay Mechanics
- **Accurate Guess Evaluation**: Proper distribution of duplicate letters (`correct` takes precedence over `present`, remaining instances marked `absent`).
- **Official & Comprehensive Dictionaries**:
  - **4-Letter Dictionary**: 930+ answers, 4,030 valid guesses.
  - **5-Letter Dictionary**: 2,300+ official Wordle answers, 10,600+ valid allowed guesses.
  - **6-Letter Dictionary**: 1,270+ answers, 15,780+ valid guesses.
- **Strict Hard Mode**: Validates that all previously revealed green (correct position) and yellow (present) letters are reused in subsequent attempts.
- **Interactive Hint System**: Need assistance? Spend 50 XP to reveal an undiscovered letter.
- **Shareable Emoji Grid**: One-click clipboard copy (`🟩🟨⬛`) with custom game mode badges.

---

### 🏆 Progression & Customization
- **Player Profile**: Real-time tracking of total XP, player level, games played, win rate, guess distribution, and current/best streaks.
- **Achievements System**: Unlockable milestone achievements with animated toast notifications.
- **Theme Support**: Easily toggle between **Classic Dark**, **Clean Light**, and **Midnight** themes.
- **Cross-Device Responsive UI**: Tailored desktop sidebar navigation and mobile bottom tab bar with dynamic board resizing.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `localStorage` persistence
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toast Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Testing**: [Vitest](https://vitest.dev/) & React Testing Library

---

## 📂 Project Structure

```
wordle/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home dashboard
│   │   ├── play/page.tsx       # Core gameplay arena (handles ?mode= and ?challenge=)
│   │   ├── daily/page.tsx      # Daily challenge route
│   │   ├── modes/page.tsx      # Game modes selection hub
│   │   ├── stats/page.tsx      # Stats & guess distribution analytics
│   │   ├── achievements/       # Trophy room & milestones
│   │   └── settings/           # Themes & player preferences
│   ├── components/
│   │   ├── game/               # Board, Tile, Keyboard, ResultModal, ModeHeader, CustomGameModal
│   │   └── layout/             # Navigation (desktop + mobile) & ThemeProvider
│   ├── data/
│   │   └── words/              # Dictionaries (4.json, 5.json, 6.json)
│   ├── engine/                 # Core logic (guess-evaluator.ts, word-validator.ts)
│   └── store/                  # Zustand stores (game-store, player-store, settings-store)
├── scripts/                    # Dictionary generation utilities
├── public/                     # Static assets
└── package.json
```

---

## 🛠️ Getting Started & How to Run

### Prerequisites
Make sure you have **Node.js 18+** installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/Hardik0385/wordle_game.git
cd wordle_game
```

### 2. Install Dependencies
```bash
npm install
```
*(Note: If your environment has peer dependency conflicts with newer React 19 libraries, use `npm install --legacy-peer-deps`)*

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### 4. Run Automated Unit Tests
To run the Vitest engine test suite:
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📄 License
MIT License. Feel free to clone, customize, and extend!
