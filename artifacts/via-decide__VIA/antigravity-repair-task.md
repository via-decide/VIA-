Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Fix the World Map routing bug: Implement a robust 404 / Deep Linking handler for GitHub Pages. 1. Because this is hosted on GitHub Pages, if a user refreshes the page while on a map subpage (e.g., via-decide.github.io/VIA/map/greece), GitHub will look for a physical folder named /map/greece/ and throw a 404, redirecting to the main platform. 2. Implement the standard SPA hash-routing fix OR the 404.html redirect hack for GitHub Pages. 3. Option A (Hash Routing): Refactor the router to use window.location.hash (e.g., #/map/greece). Update the hashchange event listener to trigger view updates. 4. Option B (404 Hack): Create a 404.html file in the root that captures the intended URL, saves it to sessionStorage, and redirects to index.html. Then, in index.html's init script, check sessionStorage for a saved redirect and force the router to load that subpage immediately.

RULES
1. Audit touched files first and identify regressions.
2. Preserve architecture and naming conventions.
3. Make minimal repairs only; do not expand scope.
4. Re-run checks and provide concise root-cause notes.
5. Return complete contents for changed files only.

SOP: REPAIR PROTOCOL (MANDATORY)
1. Strict Fix Only: Do not use repair mode to expand scope or add features.
2. Regression Check: Audit why previous attempt failed before proposing a fix.
3. Minimal Footprint: Only return contents for the actual repaired files.

REPO CONTEXT
- README snippet:
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st
- AGENTS snippet:
# AGENTS — via-decide/VIA Rules for ALL coding agents (Codex, Claude, automated PRs) working in this repository. --- ## 1. Preservation Policy 1. Never delete tool folders under `tools/`. 2. Never remove working code — upgrades are additive only. 3. Never replace a functioning file with a placeh
- package.json snippet:
{ "name": "viadecide", "version": "1.0.0", "description": "ViaD\u00e9cide: Unified decision-making platform", "private": true, "scripts": { "start": "echo 'static site \u2014 no build required'", "setup": "bash setup-monorepo.sh", "init": "node init-monorepo.js", "validate"