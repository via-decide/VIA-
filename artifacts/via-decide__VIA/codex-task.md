You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-swarm-balancer to handle process distribution and worker-pool management for heavy AI tasks. 1. Create a new directory src/core/compute/swarm-balancer/. 2. Create pool-config.json defining maximum concurrent workers, task timeout limits, and retry policies. 3. Implement WorkerPool.js (or .ts). This module must initialize and manage a pool of Node.js worker_threads (or Web Workers if in a browser-like environment). 4. Build a task distribution queue. When the PredictiveEngine identifies a computationally expensive payload-such as processing high-frequency event streams from rapid swipe-based interactions or running complex agent-to-agent negotiations-it should hand the task off to the WorkerPool. 5. The balancer must assign the task to the next idle worker. If all workers are busy, the task remains in a pending queue until a thread is freed. 6. Implement a heartbeat mechanism to detect and restart crashed or hung worker threads automatically, ensuring the swarm remains resilient.

CONSTRAINTS
Do NOT use external message brokers like RabbitMQ or Kafka. The worker pool and queue must be a native JavaScript implementation. Communication between the main thread and workers must happen via secure message passing (postMessage), ensuring zero shared-state mutation outside of designated memory buffers.

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