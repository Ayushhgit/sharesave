# Intent

AI-powered second brain for the reels, articles, products, and screenshots you save but never revisit.

Built with **Expo SDK 54**, **React 19**, **React Native 0.81**, **TypeScript 5.9**, **NativeWind 4**, **Expo Router 6**, **Reanimated 4 + Worklets**, **Moti 0.30**, **Zustand 5**, **TanStack Query 5** (with persistence), **Lucide**, **Firebase Auth 11**, **Expo Notifications**.

## Quick start

```bash
npm install
npx expo install --fix    # aligns native module versions with SDK 54
npx expo start --clear
```

Mocks are on by default (`constants/env.ts → USE_MOCKS = true`). Flip to `false` once your FastAPI backend is reachable, and populate `app.json → expo.extra.firebase` with your Firebase web config.

## Groq setup

Intent now uses Groq for AI processing when `expo.extra.groq.apiKey` is configured in `app.json`.

```json
"groq": {
  "apiKey": "gsk_...",
  "baseUrl": "https://api.groq.com/openai/v1",
  "model": "llama-3.1-8b-instant",
  "visionModel": "meta-llama/llama-4-scout-17b-16e-instruct"
}
```

With a real key, `services/items.ts` routes save analysis, categorization, summarization, and screenshot OCR through Groq. With `REPLACE_ME`, it falls back to the existing mock behavior. For production mobile builds, prefer moving the Groq key behind your backend instead of shipping it inside the client bundle.

## Backend contract

| Method | Path             | Purpose                          |
|--------|------------------|----------------------------------|
| POST   | `/save`          | Save URL / note / image          |
| GET    | `/items`         | List saved items                 |
| GET    | `/items/:id`     | Item detail                      |
| POST   | `/reminder`      | Schedule a smart reminder        |
| POST   | `/ocr`           | Extract text from screenshot     |
| POST   | `/categorize`    | Categorize free text             |
| POST   | `/summarize`     | Summarize + extract key points   |

All requests are bearer-authenticated with the Firebase ID token (`services/api.ts`).

## Folder map

```
app/            expo-router routes (auth, tabs, item, collection, modal)
components/     reusable UI (Card, Button, Chip, Sheet, ItemCard, FAB, ErrorBoundary, …)
features/       feature-scoped UI (save sheet, onboarding)
hooks/          useAuth, useItems, useFilteredItems, useTheme, useHaptics
services/       api / firebase / auth / items / notifications / queryClient
store/          zustand stores (auth, items, theme, ui)
constants/      categories, theme palette, reminder presets, env
utils/          format, storage, mock data, id, source detection, layout
types/          shared TypeScript types
assets/         icons + splash (see assets/README.md)
```

## Production-readiness

- `ErrorBoundary` wraps the whole app — surfaces friendly recovery UI
- React Query cache persisted to `AsyncStorage` for offline UX
- Zustand stores persisted (`@intent/auth`, `@intent/items`, `@intent/theme`)
- Smart reminders schedule real `expo-notifications` triggers and re-route on tap
- Safe-area aware tab bar + FAB
- Haptics, skeletons, empty states, blurred sheet backdrops everywhere
- Light / system / dark theme with `tailwind darkMode: 'class'` + manual class injection
- New architecture enabled (`newArchEnabled: true`)
- Reanimated 4 + Worklets babel plugin wired

## Configure Firebase

Edit `app.json → expo.extra.firebase` with your project's web config, then drop `USE_MOCKS` to `false`. Auth state is observed by `useAuthSubscription` (mounted once at the root).

## Known external assumptions

- `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`, `assets/favicon.png` — drop in before native build (see `assets/README.md`)
- FastAPI backend implements the 7-endpoint contract above
- Firebase project has Email/Password sign-in enabled
