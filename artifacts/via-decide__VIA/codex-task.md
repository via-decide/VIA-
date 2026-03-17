You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-self-correction-loop to enable agents to critique, validate, and repair their own reasoning before delivering a final response. 1. Create a new directory src/core/compute/self-correction/. 2. Create correction-config.json defining "Critique Levels" (e.g., Fact-Check, Logic-Consistency, Tone-Alignment), maximum retry depth (e.g., 2 passes), and confidence-score thresholds. 3. Implement CorrectionEngine.js (or .ts). This module acts as a "Reflective Layer" within the PredictiveEngine. 4. Build the "Critic" logic: Before an agent's output is published to the EventBus, the CorrectionEngine must intercept it and spawn a secondary "Critic Agent" (or a lightweight logic-check function). 5. The Critic evaluates the response against the original User Intent and the KnowledgeGraphLinker to look for hallucinations, broken code, or contradictory statements. 6. Implement the "Repair Cycle": If the Critic finds a flaw, it generates a "Correction Prompt" (e.g., "Your previous response had a syntax error in the Python snippet. Fix it.") and sends it back to the original Agent ID for a second attempt. 7. Log "Self-Correction Events" to the telemetry stream, tracking how often agents "catch" their own mistakes.

CONSTRAINTS
Do NOT allow infinite recursion; if an agent fails to correct itself within the max_retries limit, the engine must fallback to the last "best" response or trigger the HandoverManager. The Critic must be optimized to run in parallel with other WorkerPool tasks. To save costs, use a smaller, faster LLM model (or local regex/linter) for the Critic phase while the primary Agent uses a heavy model.

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