# rules/via-architecture.md — VIA Canonical Architecture Reference

## 1. SINGLE-FILE LAW
   - Everything lives in `index.html`. CSS in `<style>`. JS in `<script>`.
   - No separate `.css` or `.js` files in the VIA repository root.
   - Exceptions: `/api/*` Vercel serverless functions (separate `.js` files are allowed there only).

## 2. FILE STRUCTURE inside index.html
   - Section order: `<head>` → `<style>` → `<body>` (nav + tab panels) → `<script>`
   - Script section order: 
     1. constants 
     2. Supabase initialization 
     3. Firebase initialization 
     4. state variables 
     5. utility functions 
     6. render functions 
     7. event listeners 
     8. `boot()`
   - `boot()` is the single entry point called at the bottom of the script. Nothing auto-runs outside `boot()`.

## 3. TAB PANEL SYSTEM
   - Each tab = one `<div class="tab-panel" id="panel-[name]">`.
   - Only one panel visible at a time (`display:flex` vs `display:none`).
   - `switchTab(tabId)` is the only function allowed to change visibility.
   - Never manipulate panel visibility directly outside `switchTab()`.

## 4. SUPABASE + FIREBASE COEXISTENCE
   - Supabase client: `window._supabase` — initialized once in `boot()`.
   - Firebase app: `window._firebaseApp` — initialized once in `boot()`.
   - Auth source of truth: Supabase only. Firebase gets bridged token after Supabase auth confirms.
   - Never call both for the same data type (see `firebase.md` service split table).

## 5. STATE MANAGEMENT
   - Global state object: `window.VIA_STATE = { user, currentTab, posts, tools, ... }`.
   - All render functions read from `VIA_STATE` — never directly from the DOM.
   - State mutations: only through `setState(key, value)` helper which also triggers a re-render.

## 6. BOOT SEQUENCE (exact order)
   1. `initFirebase()`
   2. `initSupabase()`
   3. `attachNavListeners()`
   4. `checkAuthState()` → if user: `renderAuthedState()` else: `renderGuestState()`
   5. `loadFeed()` — async, non-blocking
   6. `loadTools()` — async, non-blocking
   7. `switchTab('feed')` — default tab

## 7. VERCEL CONFIG
   - `vercel.json` must always have SPA rewrite: `source "/(.*)"` → `destination "/index.html"`.
   - Environment vars injected by Vercel (never hardcoded): `VIA_SUPABASE_URL`, `VIA_SUPABASE_ANON_KEY`, `VIA_FIREBASE_API_KEY`, `VIA_FIREBASE_APP_ID`, `VIA_FIREBASE_SENDER_ID`.
   - Access in browser via: `<script> window.VIA_ENV = { ... } </script>` injected server-side OR use meta tags.

## 8. WHAT NEVER GOES IN VIA REPO
   - `package.json`, `node_modules`, `webpack/vite` config.
   - React, Vue, Angular, Svelte.
   - Any CSS framework (Tailwind, Bootstrap).
   - TypeScript.
   - Test files (tests live in separate `/tests` repository).
