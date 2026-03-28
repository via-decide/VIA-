You are working in repository via-decide/VIA on branch main.

MISSION
Fix the World Map routing bug: Register subpage routes in the central Router. 1. Locate your central routing logic file (likely router.js, app.js, or commandRouter.js). 2. Check the route registration map/switch statement. The reason the map redirects to the platform is likely because the router catches the /map/region URL, fails to find a match, and executes its fallback logic (default: loadPlatform()). 3. Dynamically or statically register the map subpages. If the regions share a template, create a wildcard route handler like matchRoute('/map/:regionId'). 4. When this route is matched, write the logic to fetch/render the correct subpage view (e.g., loading views/map/[regionId].html into the main DOM container). 5. If the subpages are standalone tools, ensure their IDs are added to the exact same registry that handles normal tool routing.

CONSTRAINTS
Pure Vanilla JS. Do not hardcode 50 different if/else statements if a dynamic regex or parameter extractor can handle all map subpages cleanly.

PROCESS (MANDATORY)
1. Read README.md and AGENTS.md before editing.
2. Audit architecture before coding. Summarize current behavior.
3. Preserve unrelated working code. Prefer additive modular changes.
4. Implement the smallest safe change set for the stated goal.
5. Run validation commands and fix discovered issues.
6. Self-review for regressions, missing env wiring, and docs drift.
7. Return complete final file contents for every modified or created file.

REPO AUDIT CONTEXT
- Description: 
- Primary language: HTML
- README snippet:
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st

- AGENTS snippet:
# AGENTS — via-decide/VIA Rules for ALL coding agents (Codex, Claude, automated PRs) working in this repository. --- ## 1. Preservation Policy 1. Never delete tool folders under `tools/`. 2. Never remove working code — upgrades are additive only. 3. Never replace a functioning file with a placeh


SOP: PRE-MODIFICATION PROTOCOL (MANDATORY)
1. Adherence to Instructions: No deviations without explicit user approval.
2. Mandatory Clarification: Immediately ask if instructions are ambiguous or incomplete.
3. Proposal First: Always propose optimizations or fixes before implementing them.
4. Scope Discipline: Do not add unrequested features or modify unrelated code.
5. Vulnerability Check: Immediately flag and explain security risks.

OUTPUT REQUIREMENTS
- Include: implementation summary, checks run, risks, rollback notes.
- Generate branch + PR package.
- Keep prompts deterministic and preservation-first.