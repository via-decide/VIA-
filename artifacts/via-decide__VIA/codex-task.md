You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-distributed-rate-limiter to protect the AI engine and database from traffic spikes, runaway agent loops, and malicious DDoS attempts. 1. Create a new directory src/core/network/rate-limiter/. 2. Create limiter-config.json defining rate limits based on entity type (e.g., Guest IPs: 50 req/min, Authenticated Users: 200 req/min, Internal Agents: 1000 req/min), penalty box duration, and window sizes. 3. Implement RateGuard.js (or .ts) using a highly optimized Token Bucket or Sliding Window algorithm. 4. Inject RateGuard as the absolute first middleware layer in the PredictiveEngine and SocketMesh. Every incoming request or WebSocket message must be evaluated before any parsing or routing occurs. 5. Build a "Penalty Box" mechanism: If an IP or Agent ID exceeds their threshold by a massive margin (e.g., 5x the limit in 10 seconds), automatically drop their packets at the TCP/socket level and log a security alert to the telemetry stream. 6. Expose an internal API endpoint so the system-telemetry-dashboard can visualize actively blocked IPs and current limit thresholds in real-time.

CONSTRAINTS
Do NOT use external data stores like Redis for this specific implementation. You must build a highly efficient, native JavaScript/TypeScript in-memory Map to track request counts and timestamps. The data structure must self-clean (garbage collect) stale IP records periodically to prevent memory leaks during high-volume distributed attacks. The check must execute in O(1) time complexity.

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