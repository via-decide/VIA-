You are working in repository via-decide/VIA on branch main.

MISSION
Finalize the cloud deployment and SPA routing. 1. Deploy the viadecide-monorepo to Vercel. 2. Configure vercel.json to handle SPA rewrites for /tool/*. 3. Verify that the shell handles URL parameter parsing for tool induction.

CONSTRAINTS
The URL structure must remain www.viadecide.com/tool/{tool-id}.
Migrate the most critical tools into the new shell system. 1. Move code for decide.engine-tools into tools/core/engine-tools/. 2. Update tool internal links to use the StateBridge for cross-platform context. 3. Register the tool as "Active" in the nav-registry.json.

CONSTRAINTS
Zero downtime for the legacy tool. Verify that the iframe induction works without scroll-lock issues.

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