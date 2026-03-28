You are working in repository via-decide/VIA on branch main.

MISSION
Build a URLResolver utility to permanently safeguard against GitHub Pages pathing errors. 1. Create a new utility file shared/url-resolver.js. 2. Implement a function resolvePath(targetPath) that detects the current environment. 3. Logic: Check window.location.hostname. If it includes github.io, detect the repository name from window.location.pathname (which will be /VIA/). 4. If the environment is GitHub Pages, the function must automatically prepend /VIA/ (or the detected repo name) to any path passed into it (e.g., resolvePath('subpage.html') returns /VIA/subpage.html). 5. If the environment is localhost, it just returns /subpage.html. 6. Refactor the index.html card rendering logic or the central router to wrap all destination URLs in this resolvePath() function before attempting navigation.

CONSTRAINTS
Pure Vanilla JS. The detection must be dynamic so that if the repository is ever renamed from "VIA" to something else, the routing doesn't break again.

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