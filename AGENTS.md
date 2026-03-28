# CLAUDE CODE EXECUTION PROMPT
# ViaDecide — Sovereign Digital Ecosystem Enhancement
# Source: Architecting Sovereign Decision Engines report
# Target repos: via-decide/VIA + via-decide/decide.engine-tools
# Execute each TASK block sequentially. Create one PR per repo on completion.

---

## CONTEXT & CONSTRAINTS (READ FIRST — APPLY TO ALL TASKS)

You are an autonomous engineering agent working on the ViaDecide platform.

**Architecture rules — never violate:**
- Zero npm/node_modules dependencies in VIA or decide.engine-tools (except Orchade which uses React/Vite — that is the ONLY exception)
- All JS is Vanilla JS, IIFE or module pattern
- No external libraries (no D3, no GSAP, no Ajv, no Lodash)
- API keys are NEVER hardcoded — always read from Firebase Auth or environment config
- CSS animations only (no JS animation libraries)
- All routing via VDRouter v3 (router.js) — do not introduce React Router or similar
- Service Workers must use Cache-First for static assets, Network-First for API/Firestore
- Check `navigator.connection.saveData` before any prefetch — disable if true (rural India metered connections)

**Repo state:**
- VIA repo path: `./` (you are in via-decide/VIA)
- Router file: `router.js` — VIARouter + VDRouter IIFE, no deps
- Service Worker: `sw.js` — CACHE name `via-v2`
- Vercel config: `vercel.json` — SPA rewrites configured, cleanUrls: true
- Manifest: `manifest.json` — standalone PWA, scope `/`

---

## TASK 1 — VIA: Fix Subpage Card Routing (Absolute → Relative Paths)

**File targets:** `index.html`, `router.js`, any JS files with `window.location.href`

**Steps:**
1. Scan `index.html` for all anchor `href` attributes starting with `/` (absolute paths like `/pages/tool.html`, `/subpage`). Replace each with relative equivalents (`./pages/tool.html`, `?page=subpage`, or `#/subpage` matching the current VDRouter pattern).
2. Search all inline `<script>` blocks and linked `.js` files for `window.location.href = '/` patterns. Update string literals to be relative (`./` or `?page=` or `VIARouter.navigate()`).
3. Verify navigation menus, breadcrumbs, and headers in `index.html` — apply same fix.
4. Do NOT alter CSS Grid layout, z-index, or visual hierarchy.
5. Do NOT introduce any framework. Match the existing `VIARouter.navigate()` call pattern already in `router.js`.

**Goal:** Prevent 404 errors when hosted at a subdirectory path on Vercel or GitHub Pages.

---

## TASK 2 — VIA: World Map Deep Linking — 404 Handler for Static Hosting

**File targets:** Create `404.html`, update `index.html` init block, update `vercel.json`

**Steps:**
1. Create `404.html` at repo root with this logic:
   - Capture `window.location.pathname` + `window.location.search`
   - Save full URL to `sessionStorage.setItem('vd_redirect', window.location.href)`
   - Execute `window.location.replace('/')` immediately
2. In `index.html`, in the earliest `<script>` block (before any routing init):
   - Check `sessionStorage.getItem('vd_redirect')`
   - If found: parse the path, call `VIARouter.navigate(resolvedRoute)`, then `sessionStorage.removeItem('vd_redirect')`
3. In `vercel.json`, add map subpage rewrites before the catch-all rewrite rule:
   ```json
   { "source": "/map/:region", "destination": "/index.html" },
   { "source": "/map/:region/:subpage", "destination": "/index.html" }
   ```
4. Test logic: simulated URL `/map/kutch` should resolve to index.html → sessionStorage redirect → VIARouter mounts map/kutch view.

**Goal:** Direct external links and hard refreshes on map subpages must resolve correctly without manual navigation.

---

## TASK 3 — VIA: Register Map Subpage Routes in VDRouter

**File targets:** `router.js`

**Steps:**
1. In `router.js`, locate the `SUBPAGES` object (the static route registry).
2. Add a dynamic wildcard handler for `/map/:regionId` routes. Do NOT add a giant hardcoded switch. Implement a regex extractor:
   ```js
   function matchWildcard(input) {
     const mapMatch = input.match(/^map[\/\-]([a-z0-9\-]+)$/i);
     if (mapMatch) return { type: 'map', regionId: mapMatch[1] };
     return null;
   }
   ```
3. In the `navigate()` function, before the SUBPAGES lookup, call `matchWildcard(route)`. If it returns a map match: asynchronously fetch `./pages/map/${regionId}.html` and inject into the main DOM container (or load from `data/maps/${regionId}.json` if that's the data pattern — check `/data/` directory first).
4. Expose `VIARouter.toMap = (regionId) => navigate('map-' + regionId)` on the public API.
5. Ensure the wildcard handler also registers these routes in the `vercel.json` rewrites (check if already covered by the SPA catch-all — if yes, no change needed to vercel.json).

**Goal:** Router acknowledges map subpages. No more fallback-to-home on map navigation.

---

## TASK 4 — decide.engine-tools: PromptAlchemy Mutation & Evaluation Engine

**File targets:** Create `tools/promptalchemy/evaluation_engine.js`, update `tools/promptalchemy/index.html`

**Steps:**
1. Create `tools/promptalchemy/evaluation_engine.js` as a pure Vanilla JS IIFE module:
   ```js
   // Schema validator — pure JS, no Ajv
   function validateSchema(output, schema) { ... }
   // Mutation loop — retry up to 3x with punitive feedback
   async function evaluateWithRetry(prompt, schema, apiCall, maxRetries = 3) { ... }
   ```
2. The `validateSchema` function must check: JSON parsability, required keys presence, type conformance, token count estimate (chars/4), no undefined/null on required fields.
3. If validation fails, `evaluateWithRetry` generates a punitive feedback prompt:
   `"Your previous output failed validation: [reason]. Fix ONLY these issues: [list]. Re-output the JSON now."`
   Re-queries the API. Repeats up to 3 times. Throws after 3 failures.
4. API keys must be retrieved from `window.VD_CONFIG` or Firebase Auth claims — never hardcoded.
5. Update `tools/promptalchemy/index.html` UI to show 3-stage evaluation pipeline:
   - Stage 1: Initial prompt + raw output
   - Stage 2: Validation result (pass/fail with reason)
   - Stage 3: Optimized final output or failure report
   Use CSS Grid, dark theme matching existing ViaDecide design tokens (`#0b0f17` bg, `#ff671f` accent).

**Goal:** Algorithmically guarantee deterministic LLM output via schema-driven mutation loops.

---

## TASK 5 — decide.engine-tools: ViaLogic SVG Rendering Optimizations

**File targets:** `tools/games/vialogic/index.html` (inline JS), or separate render JS if it exists

**Steps:**
1. Find the SVG rendering/pan-zoom logic in ViaLogic. Add a viewport culling function:
   ```js
   function isInViewport(nodeX, nodeY, camX, camY, camScale, vpW, vpH, margin = 120) {
     const sx = nodeX * camScale + camX;
     const sy = nodeY * camScale + camY;
     return sx > -margin && sx < vpW + margin && sy > -margin && sy < vpH + margin;
   }
   ```
2. On every render frame, iterate all `<circle>` and `<line>` SVG elements. Set `element.style.display = isInViewport(...) ? '' : 'none'`. Do this OUTSIDE the hot path — batch via a single `requestAnimationFrame` per frame.
3. Wrap all pan/zoom event listeners (`mousemove`, `wheel`, `touchmove`) in `requestAnimationFrame`:
   ```js
   let rafPending = false;
   element.addEventListener('mousemove', e => {
     if (rafPending) return;
     rafPending = true;
     requestAnimationFrame(() => { handlePan(e); rafPending = false; });
   });
   ```
4. Offload force-directed graph physics to a Web Worker (`vialogic-physics.worker.js`). The worker receives node positions + velocities, runs one tick of physics, posts back updated positions. Main thread only reads positions and renders — never blocks.
5. Worker file must be inline-instantiated via `URL.createObjectURL(new Blob([...], {type:'application/javascript'}))` to avoid a separate file request.

**Goal:** Sustained 60fps on graphs with 4,000+ nodes on low-end mobile hardware.

---

## TASK 6 — decide.engine-tools: Standardize PWA Manifests & Service Workers

**File targets:** `sw.js`, `manifest.webmanifest`, all tool subdirectories

**Steps:**
1. Audit: run `find . -name "manifest*.json" -o -name "manifest*.webmanifest" | grep -v node_modules` — list results.
2. Ensure root `manifest.webmanifest` has:
   ```json
   {
     "name": "ViaDecide Engine",
     "short_name": "ViaDecide",
     "display": "standalone",
     "start_url": "/",
     "background_color": "#030508",
     "theme_color": "#ff671f",
     "icons": [
       { "src": "/ui/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
       { "src": "/ui/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
     ]
   }
   ```
3. In `sw.js`, update `CACHE_NAME` to `viadecide-v3` (forces cache bust on all client devices).
4. Verify `install` event caches: `index.html`, `router.js`, `manifest.webmanifest`, `shared/shared.css`, `shared/utils.js`, `shared/tool-registry.js`, `shared/vd-auth.js`.
5. Verify `fetch` handler strategy:
   - Static assets (`.html`, `.css`, `.js`, `.png`, `.svg`, `.woff2`): **Cache First → fallback Network**
   - Firebase/Firestore/API calls (URLs containing `firestore.googleapis.com`, `identitytoolkit`, `googleapis.com`): **Network First → no cache fallback**
   - Add explicit check: `if (event.request.method !== 'GET') return;` at fetch handler top.

**Goal:** 100% offline capability for core tools. Zero stale cache issues on deployment.

---

## TASK 7 — decide.engine-tools: Refactor SkillHex Interface

**File targets:** `tools/games/skillhex-mission-control/index.html` and linked JS/CSS

**Steps:**
1. Find mission node click handlers. Replace full-screen modal trigger with **inline CSS expansion**:
   - On click: add class `.expanded` to the clicked hex node
   - `.expanded` styles: `transform: scale(1.4)`, z-index bump, overflow visible, detail panel slides in below via `max-height: 0 → max-height: 300px` CSS transition
   - Remove modal overlay entirely
2. Update Firestore XP write: wrap the `db.collection(...).set(...)` call in `async/await`. After firing the async write, do NOT await before updating the DOM.
3. Implement optimistic UI:
   ```js
   // Immediately update DOM
   updateXPDisplay(currentXP + earnedXP);
   // Then async write
   try {
     await db.collection('skillhex_leaderboard').doc(uid).update({ xp: firebase.firestore.FieldValue.increment(earnedXP) });
   } catch (err) {
     // Revert on failure
     updateXPDisplay(currentXP);
     showToast('Sync failed — progress saved locally');
   }
   ```
4. All transitions must use CSS only: `transition: transform 0.25s ease, max-height 0.3s ease, opacity 0.2s ease`. No GSAP, no JS animation.

**Goal:** Frictionless mission logging — zero UI lockup from network latency.

---

## TASK 8 — decide.engine-tools: Multi-Model AI Dispatcher

**File targets:** Create `shared/ai_dispatcher.js`

**Steps:**
1. Create `shared/ai_dispatcher.js` as a Vanilla JS module exposed on `window.VDDispatcher`:
   ```js
   window.VDDispatcher = (() => {
     const CLAUDE_TASKS = ['json_schema', 'logic_tree', 'code_output', 'structured_spec'];
     const GEMINI_TASKS = ['summarization', 'terrain_analysis', 'large_context', 'creative_brainstorm'];

     async function query(payload, mode) {
       const endpoint = CLAUDE_TASKS.includes(mode) ? _claudeCall : _geminiCall;
       return _withRetry(() => endpoint(payload), 3);
     }

     async function _withRetry(fn, maxRetries) {
       let delay = 1000;
       for (let i = 0; i < maxRetries; i++) {
         try { return await fn(); }
         catch (e) {
           if (i === maxRetries - 1) throw e;
           await new Promise(r => setTimeout(r, delay));
           delay *= 2; // exponential backoff
         }
       }
     }

     async function _claudeCall(payload) { /* use window.VD_CONFIG.claudeKey */ }
     async function _geminiCall(payload) { /* use window.VD_CONFIG.geminiKey */ }

     return { query };
   })();
   ```
2. API keys must come from `window.VD_CONFIG` (populated by Firebase Auth on login). Never hardcoded.
3. Implement exponential backoff with jitter: `delay = base * 2^attempt + Math.random() * 500`
4. Add `shared/ai_dispatcher.js` to the Service Worker's SHELL_ASSETS cache list.
5. Update 3 existing tools that directly call Claude/Gemini to use `VDDispatcher.query(payload, mode)` instead.

**Goal:** Single intelligence dispatch layer — every tool uses the optimal model without manual selection.

---

## TASK 9 — decide.engine-tools: Orchade Firebase Realtime Listeners

**File targets:** `tools/engine/` Orchade React source (EXCEPTION to vanilla JS rule — this uses React/Vite)

**Steps:**
1. In Orchade's React app, locate state management (likely `App.tsx` or a context file).
2. Break monolithic state into Firestore sub-collections:
   - `/users/{uid}/orchade/daily_stats` — daily loop variables
   - `/users/{uid}/orchade/trust_metrics` — trust mechanics
   - `/users/{uid}/orchade/recruiter_scores` — scoring data
   - `/users/{uid}/orchade/sim_config` — farm configuration
3. Replace batch `set()` calls with `onSnapshot` listeners on each sub-collection. React components subscribe to their specific slice only.
4. **Critical cost optimization:** During high-frequency simulation ticks (sub-second events), accumulate state mutations in a local `useRef` buffer. Only call `db.doc(...).update(batch)` at end-of-simulated-day or on critical events (promotion, harvest, error).
5. Add a `useEffect` cleanup that calls `unsubscribe()` on all `onSnapshot` listeners when component unmounts.

**Goal:** Cross-device sync, granular re-renders, no state desync, minimal Firestore read/write costs.

---

## TASK 10 — decide.engine-tools: IndexedDB Autosave for Creator Tool

**File targets:** `tools/creators/` creator-tool files, or `creator-tool.js`

**Steps:**
1. Create a pure Vanilla JS IndexedDB wrapper in the Creator Tool:
   ```js
   const VD_IDB = (() => {
     const DB_NAME = 'vd_creator_cache', STORE = 'sessions', VERSION = 1;
     let db;
     async function open() {
       return new Promise((res, rej) => {
         const req = indexedDB.open(DB_NAME, VERSION);
         req.onupgradeneeded = e => e.target.result.createObjectStore(STORE, { keyPath: 'id' });
         req.onsuccess = e => { db = e.target.result; res(db); };
         req.onerror = rej;
       });
     }
     async function save(data) { await open(); return new Promise((res,rej) => { const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put({id:'current',...data}); tx.oncomplete=res; tx.onerror=rej; }); }
     async function load() { await open(); return new Promise((res,rej) => { const req=db.transaction(STORE,'readonly').objectStore(STORE).get('current'); req.onsuccess=()=>res(req.result); req.onerror=rej; }); }
     async function clear() { await open(); return new Promise((res,rej) => { const req=db.transaction(STORE,'readwrite').objectStore(STORE).delete('current'); req.onsuccess=res; req.onerror=rej; }); }
     return { save, load, clear };
   })();
   ```
2. Autosave trigger: call `VD_IDB.save({ inputs: getFormState(), outputs: getGeneratedContent(), timestamp: Date.now() })` every 30 seconds via `setInterval`, AND on any `input` or `change` event on the main form (debounced 2s).
3. On tool init: call `VD_IDB.load()`. If result found and `timestamp` is < 24hrs old: show a non-intrusive toast: `"Restore previous session from [time]? [Yes] [No]"`. On Yes: repopulate form fields.
4. On successful manual export/download: call `VD_IDB.clear()`.
5. Do NOT use `localStorage` — generated text blobs will exceed the 5MB limit.

**Goal:** Zero data loss for multi-hour content generation sessions.

---

## TASK 11 — VIA: VDRouter Intelligent Asset Prefetching

**File targets:** `router.js` or `js/via-navigation.js`

**Steps:**
1. After page init (after `DOMContentLoaded`), set up an `IntersectionObserver` watching all `.card[data-route]` or `a[href]` elements in the main dashboard grid.
2. On `intersecting: true`:
   ```js
   const dest = card.dataset.route || card.getAttribute('href');
   if (!dest || dest.startsWith('http') || dest.startsWith('#')) return;
   // Save data: skip prefetch entirely
   if (navigator.connection?.saveData) return;
   // Slow connection: skip prefetch
   if (navigator.connection?.effectiveType === '2g') return;
   if (!document.querySelector(`link[rel="prefetch"][href="${dest}"]`)) {
     const link = document.createElement('link');
     link.rel = 'prefetch'; link.href = dest;
     document.head.appendChild(link);
   }
   ```
3. On `intersecting: false` (card scrolled out): remove the prefetch `<link>` tag to prevent DOM bloat.
4. Respect `navigator.connection.saveData` strictly — if true, disable ALL prefetching (critical for rural India metered connections).
5. Also skip prefetch if `navigator.connection.effectiveType` is `'2g'` or `'slow-2g'`.

**Goal:** Instantaneous tool loading on good connections. Zero bandwidth waste on metered connections.

---

## TASK 12 — VIA: Kutch Digital Map Data Ingestion Pipeline

**File targets:** Create `scripts/geo_ingest.js`, create `data/maps/` directory

**Steps:**
1. Create `scripts/geo_ingest.js` (Node.js script, runs offline at build time — not a browser dependency):
   ```js
   const fs = require('fs'), path = require('path');

   function compressGeoJSON(geojson) {
     // Truncate coordinates to 5 decimal places (~1m precision)
     return JSON.parse(JSON.stringify(geojson, (key, val) =>
       typeof val === 'number' && key !== undefined
         ? Math.round(val * 100000) / 100000
         : val
     ));
   }

   function stripProperties(geojson, keepKeys = ['name', 'type', 'sensor_id']) {
     // Remove non-essential feature properties
     if (geojson.features) {
       geojson.features = geojson.features.map(f => ({
         ...f,
         properties: Object.fromEntries(
           Object.entries(f.properties || {}).filter(([k]) => keepKeys.includes(k))
         )
       }));
     }
     return geojson;
   }

   // Process all .geojson files in data/maps/raw/
   const RAW = './data/maps/raw/', OUT = './data/maps/';
   fs.readdirSync(RAW).filter(f => f.endsWith('.geojson')).forEach(file => {
     const raw = JSON.parse(fs.readFileSync(RAW + file));
     const compressed = compressGeoJSON(stripProperties(raw));
     fs.writeFileSync(OUT + file.replace('.geojson', '.json'), JSON.stringify(compressed));
     console.log(`Compressed: ${file} → ${OUT}${file.replace('.geojson','.json')}`);
   });
   ```
2. Create `data/maps/` directory. Add `data/maps/raw/.gitkeep`.
3. Add `"geo:ingest": "node scripts/geo_ingest.js"` to `package.json` scripts.
4. In the map viewer tool: fetch `./data/maps/${regionId}.json` asynchronously. Do NOT call any geocoding API at runtime. All boundaries are pre-calculated static assets.
5. Add `data/maps/*.json` pattern to Service Worker cache during `activate` (dynamic cache, not shell cache).

**Goal:** Low-latency offline-capable map rendering for Kutch highway infrastructure visualization.

---

## EXECUTION ORDER

Run tasks in this order to minimize merge conflicts:

```
REPO: via-decide/VIA
  1. TASK 1  — Subpage card routing fix
  2. TASK 2  — World map 404 handler
  3. TASK 3  — VDRouter map route registration
  4. TASK 11 — Asset prefetching
  5. TASK 12 — Kutch map data pipeline

REPO: via-decide/decide.engine-tools
  6. TASK 6  — PWA manifest + SW standardization (do this first — affects all other tools)
  7. TASK 8  — AI dispatcher (shared utility, other tasks depend on it)
  8. TASK 4  — PromptAlchemy evaluation engine
  9. TASK 5  — ViaLogic SVG optimizations
  10. TASK 7  — SkillHex interface refactor
  11. TASK 9  — Orchade Firebase listeners
  12. TASK 10 — Creator Tool IndexedDB autosave
```

---

## PR INSTRUCTIONS

After completing all VIA tasks:
```
Branch: claude/sovereign-enhancement-via-[DATE]
PR title: feat(VIA): sovereign architecture enhancements — routing, map, PWA, prefetch
Base: main
```

After completing all decide.engine-tools tasks:
```
Branch: claude/sovereign-enhancement-engine-[DATE]
PR title: feat(engine-tools): PromptAlchemy engine, AI dispatcher, PWA v3, perf optimizations
Base: main
```

Each PR description must list: files changed, task IDs completed, any deviations from spec with justification.

---

## VALIDATION CHECKLIST (run before each PR)

- [ ] `grep -r "href=\"/" index.html` returns zero results (no absolute paths)
- [ ] `grep -r "window.location.href = '/" *.js` returns zero results
- [ ] `navigator.connection.saveData` check present in prefetch code
- [ ] No `require()` or `import` statements in browser JS files (except Orchade)
- [ ] `CACHE_NAME` updated to `viadecide-v3` in sw.js
- [ ] API keys absent from all committed files (`grep -r "sk-ant\|AIzaSy" .` returns zero)
- [ ] All new HTML files include `<meta name="viewport" content="width=device-width, initial-scale=1.0"/>`
- [ ] `world.html` and `index.html` link to each other correctly
- [ ] IndexedDB wrapper does NOT use localStorage as fallback
- [ ] Web Worker is inline-instantiated via `URL.createObjectURL` (no separate .worker.js file request needed)
