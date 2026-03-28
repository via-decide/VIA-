You are working in repository via-decide/VIA on branch main.

MISSION
Fix the World Map routing bug: Implement a robust 404 / Deep Linking handler for GitHub Pages. 1. Because this is hosted on GitHub Pages, if a user refreshes the page while on a map subpage (e.g., via-decide.github.io/VIA/map/greece), GitHub will look for a physical folder named /map/greece/ and throw a 404, redirecting to the main platform. 2. Implement the standard SPA hash-routing fix OR the 404.html redirect hack for GitHub Pages. 3. Option A (Hash Routing): Refactor the router to use window.location.hash (e.g., #/map/greece). Update the hashchange event listener to trigger view updates. 4. Option B (404 Hack): Create a 404.html file in the root that captures the intended URL, saves it to sessionStorage, and redirects to index.html. Then, in index.html's init script, check sessionStorage for a saved redirect and force the router to load that subpage immediately.

CONSTRAINTS
Ensure deep linking works. A user should be able to copy the URL of a specific world map subpage, send it to a friend, and have it open directly to that subpage without forcing them through the main platform dashboard first.

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