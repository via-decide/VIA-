Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-self-correction-loop to enable agents to critique, validate, and repair their own reasoning before delivering a final response. 1. Create a new directory src/core/compute/self-correction/. 2. Create correction-config.json defining "Critique Levels" (e.g., Fact-Check, Logic-Consistency, Tone-Alignment), maximum retry depth (e.g., 2 passes), and confidence-score thresholds. 3. Implement CorrectionEngine.js (or .ts). This module acts as a "Reflective Layer" within the PredictiveEngine. 4. Build the "Critic" logic: Before an agent's output is published to the EventBus, the CorrectionEngine must intercept it and spawn a secondary "Critic Agent" (or a lightweight logic-check function). 5. The Critic evaluates the response against the original User Intent and the KnowledgeGraphLinker to look for hallucinations, broken code, or contradictory statements. 6. Implement the "Repair Cycle": If the Critic finds a flaw, it generates a "Correction Prompt" (e.g., "Your previous response had a syntax error in the Python snippet. Fix it.") and sends it back to the original Agent ID for a second attempt. 7. Log "Self-Correction Events" to the telemetry stream, tracking how often agents "catch" their own mistakes.

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