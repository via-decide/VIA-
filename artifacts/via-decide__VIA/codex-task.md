You are working in repository via-decide/VIA on branch main.

MISSION
Fix Subpage Card routing on index.html: Convert absolute paths to relative/hash paths. 1. Open index.html and locate all the "Subpage Card" elements. 2. Inspect their href attributes or data-route attributes. 3. If they start with a forward slash (e.g., href="/pages/tool.html" or href="/subpage"), remove the leading slash or replace it with a dot (e.g., href="./pages/tool.html" or href="?page=subpage" or href="#/subpage" depending on the routing architecture). 4. If the cards use JavaScript onclick events featuring window.location.href = '/something', update those strings to be relative to the current path. 5. Apply this same fix to any navigation menus or headers present in index.html.

CONSTRAINTS
Do not change the visual layout of the cards. Ensure the fix respects the current routing pattern (whether it's multi-page HTML or Single Page App hash routing).

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