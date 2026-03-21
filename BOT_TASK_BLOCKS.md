# 🤖 VIADECIDE BOT TASK BLOCKS (PHASE 1-3)

Use these blocks to trigger PRs and commits via your Telegram bot.

---

### [TASK 1] SHELL INFRASTRUCTURE & ROUTING
```
/task
repo: via-decide/VIA
mode: codex_then_antigravity
task: >
  Implement the core shell and routing foundation for the monorepo.
  1. Build `shell/index.html` with a responsive sidebar and tool-runner iframe.
  2. Implement `shell/router.js` to handle `/tool/{id}` and `/search` routes.
  3. Integrate `shell/nav-registry.json` for dynamic sidebar navigation.
constraints: >
  Ensure all navigation is SPA-based (no full page reloads). The sidebar must be collapsible on mobile.
goal: >
  Establish the unified platform shell where all migrated tools will reside.
/end_task
```

---

### [TASK 2] BACKEND AUTH & STATE BRIDGE
```
/task
repo: via-decide/VIA
mode: codex_then_antigravity
task: >
  Implement the central platform services for authentication and cross-tool state.
  1. Create `services/auth-service.js` for JWT-based sign-up and login logic.
  2. Implement `services/state-bridge.js` to enable localStorage-based data sharing between iframes.
  3. Create `services/config.js` to centralize API endpoints and feature flags.
constraints: >
  Auth must use strict JWT validation. State bridge must prevent cross-domain pollution.
goal: >
  Provide a unified backend context for all consolidated tools.
/end_task
```

---

### [TASK 3] BATCH 1 TOOL MIGRATION (CRITICAL)
```
/task
repo: via-decide/VIA
mode: codex_then_antigravity
task: >
  Migrate the first batch of critical engine tools into the monorepo.
  1. Port `decide.engine-tools` to `tools/core/engine-tools/`.
  2. Port `decide.engine` to `tools/core/decide-engine/`.
  3. Port `cohort` to `tools/core/cohort/`.
  4. Ensure all manifest files are correctly registered in `nav-registry.json`.
constraints: >
  Maintain original tool functionality perfectly. Update all internal asset links to be relative to the new monorepo path.
goal: >
  Successfully integrate high-impact core tools into the new architecture.
/end_task
```

---

### [TASK 4] SEARCH & DISCOVERY ENGINE
```
/task
repo: via-decide/VIA
mode: codex_then_antigravity
task: >
  Build the global search and discovery interface within the shell.
  1. Implement a search component in `shell/index.html` that queries `nav-registry.json`.
  2. Create a "Tool Gallery" view for the `/search` route.
  3. Add keyword indexing to the registry for faster discovery.
constraints: >
  Search must be instant (<100ms) and reflect the user's current access levels.
goal: >
  Make the 44+ tools easily discoverable within the unified platform.
/end_task
```

---

### [TASK 5] REALTIME BUS DEPLOYMENT (RECAP)
```
/task
repo: via-decide/VIA
mode: codex_then_antigravity
task: >
  Deploy the `via-realtime-bus` system to enable "glass-box" transparency.
  1. Finalize the `src/core/network/realtime/` implementation.
  2. Hook the `SocketManager` into the production Node.js server.
  3. Initialize the Redis backplane for global event broadcasting.
constraints: >
  Zero-buffer token streaming is mandatory. Ensure heartbeat monitoring for dead socket cleanup.
goal: >
  Enable real-time collaboration and transparency for all platform interactions.
/end_task
```
