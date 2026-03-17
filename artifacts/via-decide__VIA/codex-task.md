You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-distributed-cron-scheduler to allow autonomous agents to wake up and execute recurring background tasks. 1. Create a new directory src/core/compute/cron-scheduler/. 2. Create schedule-config.json defining active cron jobs, their cron expressions (e.g., "0 * * * *" for hourly), and the target agent or event topic to trigger. 3. Implement Scheduler.js (or .ts). This module must parse cron expressions and manage an internal timer queue to trigger jobs exactly when scheduled. 4. Build a "Distributed Lock" mechanism. If the VIA backend is ever scaled horizontally across multiple Node processes, ensure that a scheduled task (like "Hourly Database Cleanup" or "Daily Summary Generation") only fires once globally, not once per server. 5. Integrate with the EventBus and WorkerPool. When a cron job fires, the Scheduler should not execute the heavy logic itself. Instead, it must publish a trigger event to the EventBus, which the SwarmBalancer will then assign to an available worker thread. 6. Add a "Missed Job" recovery protocol. If the server is offline during a scheduled time, detect the missed execution upon startup and fire it immediately if it falls within a configurable grace period.

CONSTRAINTS
Do NOT use heavy external scheduling libraries like node-cron or agenda if they rely on external databases like MongoDB or Redis to function. You must build a lightweight, native JavaScript timeout/interval manager. The cron parser must accurately handle standard 5-part cron syntax.

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