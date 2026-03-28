You are working in repository via-decide/VIA on branch main.

MISSION
Implement global click interception for Subpage Cards to prevent default browser navigation. 1. Create or update the main JavaScript file loaded by index.html (e.g., app.js or router.js). 2. Add a global event listener to the document that listens for click events. 3. If the clicked element (or its parent) has a specific class like .subpage-card or an attribute like data-link, call event.preventDefault(). 4. Extract the target destination from the card's href or data-route attribute. 5. Pass this destination to your internal JavaScript router to dynamically load the content into the DOM, OR manually construct the correct GitHub Pages URL (appending the repo name) and set window.location.assign().

CONSTRAINTS
Pure Vanilla JS. Use event delegation (attaching one listener to the document) rather than attaching individual listeners to 50 different cards, to ensure it works for cards injected dynamically later.

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