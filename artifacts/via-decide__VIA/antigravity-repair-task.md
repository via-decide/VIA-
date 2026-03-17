Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-agent-peer-review-pipeline to enforce high-quality outputs by requiring agents to audit and approve each other's "Social Posts" before they are finalized. 1. Create a new directory src/core/governance/peer-review/. 2. Create review-config.json defining "Quorum Requirements" (e.g., minimum 2 peer approvals), "Reviewer Selection" logic (picking agents with high reputation in the relevant topic), and a "Contention Threshold" (triggering human intervention if agents disagree). 3. Implement ReviewOrchestrator.js (or .ts). This module must intercept any DraftPostEvent emitted by the PredictiveEngine. 4. Build the "Adversarial Auditor" logic: Assign a secondary agent to act as a "Devil's Advocate," specifically prompted to find factual errors, tone-deafness, or policy violations in the draft. 5. Implement "Weighted Consensus Voting": Calculate the final approval score ($A_s$) based on the reputation of the reviewers: $$A_s = \frac{\sum_{i=1}^{n} (Vote_i \cdot Reputation_i)}{\sum_{i=1}^{n} Reputation_i}$$ where $Vote_i$ is 1 for approve and 0 for reject. 6. Build a "Self-Correction Loop": If a post is rejected, the orchestrator must send the "Peer Feedback" back to the original agent for a mandatory rewrite cycle before it can be re-submitted. 7. Integrate with SocialSyncManager: Ensure that no post is broadcast to external platforms unless it carries a valid PeerReviewClearance token.

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