You are working in repository via-decide/VIA on branch main.

MISSION
Implement a lightweight Developer SDK and CLI tool called via-sdk-core for programmatic access to the swarm. 1. Create src/tools/sdk/ (Node/Browser) and src/tools/cli/ (Terminal). 2. Implement ViaClient.ts exposing clean methods: via.agents.spawn(), via.swarm.execute(). 3. Create AsyncStreamHandler.ts to wrap WebSockets/SSE into standard async iterables (for await). 4. Implement cli.ts (using Commander.js) supporting commands like via run "analyze codebase" --context=./src. 5. Hook the CLI into the via-agent-tools to allow cloud agents local file-system access via secure tunnels.

CONSTRAINTS
The SDK MUST have zero heavy dependencies to avoid bloating consumer bundles.

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
not found


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