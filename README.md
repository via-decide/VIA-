# VIA - Bharat's Social Platform

VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase.

## Features

- **Feed**: Browse a fast, social-first stream of posts, reactions, and conversations.
- **Deep Dives**: Explore longer-form stories, explainers, and curated insights.
- **Discover**: Find people, communities, and conversations across the platform.
- **Authentication**: Sign in with Google or phone-based authentication using Firebase Auth.
- **Realtime data**: Keep profiles, posts, and community activity synced with Firestore.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Animation**: Motion
- **Icons**: Lucide React
- **Backend**: Firebase Auth + Firestore
- **AI integration**: Google Gemini API

## Installation

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Setup

1. Clone the repository.
   ```bash
   git clone https://github.com/via-decide/game.git
   cd game
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Create a local environment file.
   ```bash
   cp .env.example .env
   ```
4. Configure Firebase.
   - Preferred: provide `firebase-applet-config.json` at the repository root.
   - Fallback: set all `VITE_FIREBASE_*` variables in `.env`.
5. Start the development server.
   ```bash
   npm run dev
   ```

## Production Build

```bash
npm run build
```

Vite is configured with an `esnext` build target so the app can use top-level `await` for Firebase configuration loading.

## Sovereign Integration Blueprint

A preservation-first Mars + Orchade integration package now lives in `docs/sovereign-platform-integration/` with a standalone dashboard shell, reverse-proxy example, encrypted SSO bridge sample, and Cohort telemetry schema update.

The main `index.html` dashboard now also includes an Upgrades & Roadmap telemetry panel backed by `GET /api/upgrades/status`, surfacing commit counts, integration-track progress, and the latest cross-repository commit activity for Mars and Orchade.

## Environment Variables

The app supports the following Firebase environment variables when `firebase-applet-config.json` is unavailable:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_DATABASE_ID`

## License

This project is licensed under the Apache-2.0 License. See `LICENSE` for details.
