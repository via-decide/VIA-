Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Finalize the cloud deployment and SPA routing. 1. Deploy the viadecide-monorepo to Vercel. 2. Configure vercel.json to handle SPA rewrites for /tool/*. 3. Verify that the shell handles URL parameter parsing for tool induction.
Migrate the most critical tools into the new shell system. 1. Move code for decide.engine-tools into tools/core/engine-tools/. 2. Update tool internal links to use the StateBridge for cross-platform context. 3. Register the tool as "Active" in the nav-registry.json.

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
{ "name": "via-static-site", "private": true, "version": "0.0.0", "scripts": { "dev": "python3 -m http.server 3000", "build": "node -e \"console.log('Static site: no build step required.')\"", "preview": "python3 -m http.server 4173", "clean": "rm -rf dist", "lint": "tsc