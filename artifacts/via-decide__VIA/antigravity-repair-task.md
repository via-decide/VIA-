Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-distributed-cron-scheduler to allow autonomous agents to wake up and execute recurring background tasks. 1. Create a new directory src/core/compute/cron-scheduler/. 2. Create schedule-config.json defining active cron jobs, their cron expressions (e.g., "0 * * * *" for hourly), and the target agent or event topic to trigger. 3. Implement Scheduler.js (or .ts). This module must parse cron expressions and manage an internal timer queue to trigger jobs exactly when scheduled. 4. Build a "Distributed Lock" mechanism. If the VIA backend is ever scaled horizontally across multiple Node processes, ensure that a scheduled task (like "Hourly Database Cleanup" or "Daily Summary Generation") only fires once globally, not once per server. 5. Integrate with the EventBus and WorkerPool. When a cron job fires, the Scheduler should not execute the heavy logic itself. Instead, it must publish a trigger event to the EventBus, which the SwarmBalancer will then assign to an available worker thread. 6. Add a "Missed Job" recovery protocol. If the server is offline during a scheduled time, detect the missed execution upon startup and fire it immediately if it falls within a configurable grace period.

RULES
1. Audit touched files first and identify regressions.
2. Preserve architecture and naming conventions.
3. Make minimal repairs only; do not expand scope.
4. Re-run checks and provide concise root-cause notes.
5. Return complete contents for changed files only.

SOP: REPAIR PROTOCOL (MANDATORY)
1. Strict Fix Only: Do not use repair mode to expand scope or add features.
2. Regression Check: Audit why previous attempt failed before proposing a fix.
3. Minimal Footprint: Only return contents for the actual repaired files.

REPO CONTEXT
- README snippet:
not found
- AGENTS snippet:
not found
- package.json snippet:
not found