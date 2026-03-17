Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-fault-tolerance-system to ensure the AI swarm remains resilient and self-healing in the face of thread crashes or logic errors. 1. Create a new directory src/core/infrastructure/fault-tolerance/. 2. Create fault-tolerance-config.json defining retry limits (e.g., 3 attempts), exponential backoff settings (base 200ms, max 5s), and "Health Check" intervals. 3. Implement HealthMonitor.js (or .ts). This module must maintain a "Heartbeat Map" of all active worker threads in the WorkerPool. 4. Build a "Circuit Breaker" pattern: If an Agent ID fails to process its queue or returns 500-series errors more than X times in a sliding window, the monitor must "Trip" the circuit, temporarily routing requests to a lightweight fallback agent or returning a "System Busy" status. 5. Implement "Stateful Recovery": When a worker thread crashes, the monitor must automatically respawn it and use the EdgeStore to re-hydrate the agent's last known "Memory Snapshot" before it resumes processing the EventBus queue. 6. Add a "Poison Pill" detector: Identify and discard specific input payloads that cause consistent crashes across multiple agents to prevent recursive system failure. 7. Integrate with SystemTelemetry: Log all "Death & Rebirth" cycles to provide developers with a clear picture of swarm stability.

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