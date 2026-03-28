Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Fix the World Map routing bug: Register subpage routes in the central Router. 1. Locate your central routing logic file (likely router.js, app.js, or commandRouter.js). 2. Check the route registration map/switch statement. The reason the map redirects to the platform is likely because the router catches the /map/region URL, fails to find a match, and executes its fallback logic (default: loadPlatform()). 3. Dynamically or statically register the map subpages. If the regions share a template, create a wildcard route handler like matchRoute('/map/:regionId'). 4. When this route is matched, write the logic to fetch/render the correct subpage view (e.g., loading views/map/[regionId].html into the main DOM container). 5. If the subpages are standalone tools, ensure their IDs are added to the exact same registry that handles normal tool routing.

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