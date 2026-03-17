You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-edge-cache-manager to handle distributed, high-speed data retrieval for read-heavy operations. 1. Create a new directory src/core/storage/edge-cache/. 2. Create cache-config.json defining cache tiers, TTL (Time-To-Live) settings, and eviction policies (e.g., LRU - Least Recently Used). 3. Implement EdgeStore.js (or .ts). This class must act as an in-memory Key-Value store designed to sit in front of the primary database. 4. Build a cache invalidation mechanism using a pub/sub model. When a core entity (like a user profile or agent state) is updated in the main DB, the system must broadcast an invalidation event to clear out stale edge data. 5. Integrate EdgeStore.js with the previously built PredictiveEngine. The router should now intercept "read" requests and attempt to serve them directly from the edge cache before falling back to the main database query queue. 6. Add telemetry hooks to log Cache Hit Ratio, Eviction Count, and Memory Usage.

CONSTRAINTS
Do NOT use external caching solutions like Redis or Memcached. You must implement a native, highly optimized in-memory Map structure in JavaScript/TypeScript. The LRU eviction logic must execute in O(1) time complexity to ensure the cache does not become a bottleneck during traffic spikes.
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