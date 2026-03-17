Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-swarm-balancer to handle process distribution and worker-pool management for heavy AI tasks. 1. Create a new directory src/core/compute/swarm-balancer/. 2. Create pool-config.json defining maximum concurrent workers, task timeout limits, and retry policies. 3. Implement WorkerPool.js (or .ts). This module must initialize and manage a pool of Node.js worker_threads (or Web Workers if in a browser-like environment). 4. Build a task distribution queue. When the PredictiveEngine identifies a computationally expensive payload-such as processing high-frequency event streams from rapid swipe-based interactions or running complex agent-to-agent negotiations-it should hand the task off to the WorkerPool. 5. The balancer must assign the task to the next idle worker. If all workers are busy, the task remains in a pending queue until a thread is freed. 6. Implement a heartbeat mechanism to detect and restart crashed or hung worker threads automatically, ensuring the swarm remains resilient.

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