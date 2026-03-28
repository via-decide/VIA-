Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Fix the World Map routing bug: Update Map Link event listeners to prevent default redirects. 1. Locate the file containing the World Map UI (e.g., world-map.html, map.js, or the inline SVG map). 2. Inspect the clickable regions (anchors, <g> tags, or <path> elements representing the subpages). 3. If they use standard href="/subpage" links, they are triggering full page reloads which GitHub Pages routes back to the root platform. 4. Change these to use your SPA routing format (e.g., href="#/map/region-name" or data-route="region-name"). 5. Add a JavaScript event listener to the map container that intercepts clicks on these regions. Call event.preventDefault() to stop the browser from redirecting, and instead manually pass the target route to the internal SPA Router (e.g., Router.navigate('/map/region-name')).

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