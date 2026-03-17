You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-agent-state-recovery to ensure fault tolerance and memory persistence for long-running autonomous agents. 1. Create a new directory src/core/compute/state-recovery/. 2. Create snapshot-config.json defining state serialization intervals (e.g., every 10 interaction turns or 60 seconds), max snapshot size, and retry thresholds. 3. Implement SnapshotEngine.js (or .ts). This module must listen to agent activity and periodically serialize their current context window, active goals, and local memory. 4. Integrate the SnapshotEngine with the AsyncDbSync queue to persist these state checkpoints to the primary database without blocking the main thread. 5. Build a HydrationManager. When the SwarmBalancer detects a crashed worker thread or the Node server restarts, the HydrationManager must automatically fetch the last known snapshot for the interrupted agent and inject it into a fresh worker thread. 6. Implement a "Dead Letter Queue" for agents that repeatedly crash upon hydration, quarantining them for developer review to prevent infinite crash loops.

CONSTRAINTS
Do NOT use blocking synchronous methods like JSON.stringify() on massive context objects in the main thread. You must use Node's asynchronous streams or offload serialization to a background thread to prevent event loop lag. The state restoration must be completely seamless to the end-user (e.g., a user chatting with an agent on WhatsApp should not realize the backend thread crashed and rebooted).

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
not found

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