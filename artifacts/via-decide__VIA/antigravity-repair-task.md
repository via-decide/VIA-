Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Fix Subpage Card routing on index.html: Convert absolute paths to relative/hash paths. 1. Open index.html and locate all the "Subpage Card" elements. 2. Inspect their href attributes or data-route attributes. 3. If they start with a forward slash (e.g., href="/pages/tool.html" or href="/subpage"), remove the leading slash or replace it with a dot (e.g., href="./pages/tool.html" or href="?page=subpage" or href="#/subpage" depending on the routing architecture). 4. If the cards use JavaScript onclick events featuring window.location.href = '/something', update those strings to be relative to the current path. 5. Apply this same fix to any navigation menus or headers present in index.html.

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