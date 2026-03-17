You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-ab-testing-suite to enable empirical experimentation and optimization of agent responses and interaction logic. 1. Create a new directory src/core/experimentation/ab-testing-suite/. 2. Create ab-testing-config.json defining active experiments, traffic allocation percentages (e.g., 90% Control, 10% Variant), and success metric definitions (e.g., Sentiment Score increase, Task Completion time, or User "Like" rate). 3. Implement ExperimentEngine.js (or .ts). This module must act as a logic-branching middleman in the PredictiveEngine. 4. Build a "Deterministic Segmenter": Use a hash of the GlobalID and the ExperimentID to ensure that a specific user consistently sees the same variant across sessions without needing a centralized state database. 5. Implement "Variant Injection": Allow agents to load different system prompts, model parameters, or logic branches based on the assigned experimental bucket. 6. Build an "Automated Winner Promotion" logic: If a variant demonstrates a statistically significant improvement (e.g., p < 0.05) over the control based on the EvolutionMonitor data, the engine should flag it for automatic deployment to 100% of traffic. 7. Integrate with TraceLogger: Tag every interaction with its associated ExperimentID and VariantID for downstream data analysis.

CONSTRAINTS
Do NOT use external A/B testing platforms like Optimizely or LaunchDarkly. The logic must be entirely local and execute in <2ms. The statistical math (Mean, Standard Deviation, T-Test) must be implemented natively to avoid dependency bloat. Ensure that "Experiment Overlap" is managed-a single user should not be part of two conflicting experiments that modify the same agent behavior.

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