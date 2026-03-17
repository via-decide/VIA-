Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-distributed-lock-manager (DLM) to prevent race conditions and ensure atomic operations across the decentralized AI swarm. 1. Create a new directory src/core/concurrency/lock-manager/. 2. Create lock-config.json defining default lock TTL (Time-to-Live), maximum retry attempts, and wait-time jitter to prevent "thundering herd" problems. 3. Implement LockManager.js (or .ts). This module must provide high-level acquire(resourceId), release(resourceId), and extend(resourceId) methods. 4. Build the locking engine: In a single-node environment, use a highly optimized Map with expiration timers. For multi-thread safety, utilize Atomics and SharedArrayBuffer to manage lock states across the WorkerPool without the overhead of message passing. 5. Integrate with AsyncDbSync and IdentityStore: Ensure that if two agents try to update the same user's "Memory State" simultaneously, one must wait for the lock while the other completes the write, preserving data consistency. 6. Implement a "Deadlock Detector": Periodically scan active locks for "Orphaned Locks" (locks held by crashed worker threads) and force-release them based on the TTL.

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