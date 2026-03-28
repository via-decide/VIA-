Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement global click interception for Subpage Cards to prevent default browser navigation. 1. Create or update the main JavaScript file loaded by index.html (e.g., app.js or router.js). 2. Add a global event listener to the document that listens for click events. 3. If the clicked element (or its parent) has a specific class like .subpage-card or an attribute like data-link, call event.preventDefault(). 4. Extract the target destination from the card's href or data-route attribute. 5. Pass this destination to your internal JavaScript router to dynamically load the content into the DOM, OR manually construct the correct GitHub Pages URL (appending the repo name) and set window.location.assign().

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