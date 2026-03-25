You are working in repository via-decide/VIA on branch main.

MISSION
Fix the submodule data-sync blockade (CORS & Session passing). 1. In the main index.html, add a secure postMessage protocol to transmit the active Google ID JWT token down into the Mars and Orchade iframes the moment they load. 2. Update the backend API endpoints (/api/sync, /api/telemetry) to include strict CORS headers allowing requests ONLY from viadecide.com.

CONSTRAINTS
Must use defense-grade token handling. Never expose the raw Google OAuth keys in the frontend URL parameters.
Fix the '404 on Refresh' bug by implementing a Sovereign Reverse Proxy routing rule. 1. Create or update the nginx.conf (or vercel.json/netlify.toml depending on host). 2. Implement the Catch-All SPA fallback: All requests to /mars/* or /orchade/* must resolve back to the main index.html WITHOUT changing the URL in the browser. 3. Map the proxy routes explicitly so the main server knows exactly where the cloned submodule assets live.

CONSTRAINTS
Do not disrupt the /api/auth Google Login routes.

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