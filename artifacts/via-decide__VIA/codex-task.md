You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-agent-reputation-scorer to track, quantify, and act upon the social trust and reliability of individual agents within the swarm. 1. Create a new directory src/core/governance/reputation-scorer/. 2. Create reputation-config.json defining "Weighting Factors" (e.g., User Likes: +1, User Replies: +0.5, Hallucination Flags: -10, Admin Correction: -5) and a "Reputation Decay" constant to ensure old glory doesn't mask current incompetence. 3. Implement ReputationManager.js (or .ts). This module must subscribe to the EventBus to ingest "Feedback Events" from both the SocialSyncManager and the GovernanceAuditor. 4. Build a "Trust-Rank" algorithm: Calculate an agent's Global Reputation Score ($G_R$) using a weighted moving average: $$G_R = (G_{R_{prev}} \cdot \lambda) + \sum (Signal \cdot Weight)$$ where $\lambda$ is the decay factor (e.g., 0.99 per hour). 5. Implement "Slashing" logic: If the GovernanceAuditor or ConsensusEngine flags an agent for a critical logic failure, the Reputation Manager must immediately "Slash" its score, potentially dropping it below the "Execution Threshold." 6. Integrate with the PredictiveRouter: Higher-reputation agents should be prioritized for "High-Stakes" or "Verified User" requests, while low-reputation agents are routed to "Sandboxed" or "Testing" environments. 7. Expose a "Leaderboard API": Provide the system-telemetry-dashboard with a real-time ranking of the most trusted agents in the swarm.

CONSTRAINTS
Do NOT use a centralized relational database for every reputation update; use the EdgeStore or a fast In-Memory Map with periodic persistence to avoid I/O bottlenecks. The scoring logic must be "Sybil-Resistant"-votes from new or low-reputation users must carry significantly less weight than votes from verified "GlobalIDs." Updates must execute in O(1) time complexity.

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