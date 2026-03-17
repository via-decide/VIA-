You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-self-evolution-monitor to track, analyze, and visualize the longitudinal performance and "intelligence growth" of the agent swarm. 1. Create a new directory src/core/diagnostics/evolution-monitor/. 2. Create evolution-config.json defining key performance indicators (KPIs) such as: Success-to-Correction Ratio, Token Efficiency Trend, Latency Variance, and "Hallucination Delta" (based on Consensus Engine overrides). 3. Implement EvolutionManager.js (or .ts). This module must aggregate data from the TraceLogger, Self-Correction-Loop, and SwarmConsensusEngine. 4. Build a "Performance Baseline" engine: Calculate a 7-day rolling average for every Agent ID. When an agent's current performance deviates significantly (positively or negatively) from its baseline, trigger an EvolutionEvent. 5. Implement "Version Impact Tracking": Integrate with the PluginLoader. If an agent's source code or system prompt is updated, the monitor must isolate and measure the specific performance delta caused by that "mutation." 6. Create a "Swarm Health Score": A high-level aggregate metric that represents the overall stability and accuracy of the entire VIA backend. 7. Expose a getEvolutionData() API that returns time-series JSON formatted for easy rendering of performance-over-time graphs in the admin dashboard.

CONSTRAINTS
Do NOT use heavy external BI or analytics platforms like Grafana or Mixpanel for the core calculation logic. All statistical processing (Standard Deviation, Moving Averages) must be implemented natively using efficient JavaScript math. The monitoring overhead must be strictly non-blocking and should not increase the memory footprint of individual worker threads by more than 2MB.

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