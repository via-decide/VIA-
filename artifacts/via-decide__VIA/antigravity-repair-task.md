Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-agent-state-recovery to ensure fault tolerance and memory persistence for long-running autonomous agents. 1. Create a new directory src/core/compute/state-recovery/. 2. Create snapshot-config.json defining state serialization intervals (e.g., every 10 interaction turns or 60 seconds), max snapshot size, and retry thresholds. 3. Implement SnapshotEngine.js (or .ts). This module must listen to agent activity and periodically serialize their current context window, active goals, and local memory. 4. Integrate the SnapshotEngine with the AsyncDbSync queue to persist these state checkpoints to the primary database without blocking the main thread. 5. Build a HydrationManager. When the SwarmBalancer detects a crashed worker thread or the Node server restarts, the HydrationManager must automatically fetch the last known snapshot for the interrupted agent and inject it into a fresh worker thread. 6. Implement a "Dead Letter Queue" for agents that repeatedly crash upon hydration, quarantining them for developer review to prevent infinite crash loops.

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