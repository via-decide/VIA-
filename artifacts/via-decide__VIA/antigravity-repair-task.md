Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-budget-rebalancer to dynamically manage and shift virtual LLM credits across the agent swarm based on real-time performance and ROI. 1. Create a new directory src/core/finance/budget-rebalancer/. 2. Create budget-config.json defining daily token quotas, cost-per-thousand-tokens for different model tiers, and "Priority Weights" for critical system agents. 3. Implement Rebalancer.js (or .ts). This module acts as the "CFO" of the AI swarm, monitoring the operational cost of every autonomous action. 4. Build the "ROI Tracking" logic: Integrate with the TraceLogger and SentimentTracker to calculate an Efficiency Score for each agent (e.g., [Successful Tasks + Positive Sentiment] / [Token Cost]). 5. Implement the "Dynamic Shift" mechanism: If the "NewsAgent" is burning through its daily budget with low engagement while the "ResearchAgent" is providing high-value hits, the Rebalancer should automatically re-allocate 15% of the NewsAgent's remaining quota to the ResearchAgent in real-time. 6. Add a "Emergency Brake": If the total system spend hits 90% of the daily limit, the Rebalancer must signal the PredictiveRouter to switch all non-critical agents to "Low-Cost" local models or cached responses only.

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