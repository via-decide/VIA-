You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-predictive-latency-optimizer to proactively manage system resources and worker thread scaling based on real-time traffic forecasting. 1. Create a new directory src/core/infrastructure/latency-optimizer/. 2. Create latency-config.json defining "Scale-Up" and "Scale-Down" thresholds, minimum/maximum worker counts, and observation window sizes (e.g., 5-minute segments). 3. Implement LatencyPredictor.js (or .ts). This module must consume arrival-rate data from the SocketMesh and API-Gateway. 4. Build a "Traffic Forecaster": Use a simple Linear Regression or Weighted Moving Average algorithm to predict the next 60 seconds of request volume. $$P_{t+1} = \alpha \cdot R_t + (1 - \alpha) \cdot P_t$$ where $P$ is the predicted load, $R$ is the actual rate, and $\alpha$ is the smoothing factor. 5. Implement "Proactive Scaling": If the predicted load exceeds the current capacity of the WorkerPool, the optimizer must signal the engine to spin up new worker threads *before* the traffic spike hits. 6. Build a "Cool-Down" logic: To prevent "Thrashing" (rapidly starting and stopping threads), the optimizer must enforce a minimum uptime for every worker before it can be decommissioned during a traffic lull. 7. Integrate with the BudgetRebalancer: If the system is in "Low-Cost" mode, the optimizer should prioritize higher latency over expensive thread overhead.

CONSTRAINTS
Do NOT rely on external infrastructure-level auto-scalers like Kubernetes HPA or AWS Auto Scaling Groups. This must be an internal, application-level optimization for the Node.js WorkerPool. The forecasting math must be ultra-lightweight to ensure that predicting the load doesn't actually contribute to the load itself. Use PerformanceObserver to measure execution time accurately.

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