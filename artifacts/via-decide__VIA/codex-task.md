You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-edge-cache-manager to handle distributed, high-speed data retrieval for read-heavy operations. 1. Create a new directory src/core/storage/edge-cache/. 2. Create cache-config.json defining cache tiers, TTL (Time-To-Live) settings, and eviction policies (e.g., LRU - Least Recently Used). 3. Implement EdgeStore.js (or .ts). This class must act as an in-memory Key-Value store designed to sit in front of the primary database. 4. Build a cache invalidation mechanism using a pub/sub model. When a core entity (like a user profile or agent state) is updated in the main DB, the system must broadcast an invalidation event to clear out stale edge data. 5. Integrate EdgeStore.js with the previously built PredictiveEngine. The router should now intercept "read" requests and attempt to serve them directly from the edge cache before falling back to the main database query queue. 6. Add telemetry hooks to log Cache Hit Ratio, Eviction Count, and Memory Usage.

CONSTRAINTS
Do NOT use external caching solutions like Redis or Memcached. You must implement a native, highly optimized in-memory Map structure in JavaScript/TypeScript. The LRU eviction logic must execute in O(1) time complexity to ensure the cache does not become a bottleneck during traffic spikes.

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