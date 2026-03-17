You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-predictive-personalization-engine to dynamically rank and tailor social content feeds based on real-time user engagement and behavioral signals. 1. Create a new directory src/core/ux/personalization-engine/. 2. Create personalization-config.json defining "Dopamine Decay" rates (how fast old interests fade), engagement weights (e.g., a "Share" is worth 5x a "Like"), and the "Exploration Factor" (the percentage of novel/random content to inject to prevent echo chambers). 3. Implement PersonalizationEngine.js (or .ts). This module must act as a real-time re-ranking layer for the SocialSyncManager. 4. Build the "Interest Profiler": As users interact with agents or posts, update an ephemeral "Interest Vector" in the EdgeStore. This must be a rolling window to account for "Interest Drift" over time. 5. Implement the "Scoring Logic": Use a lightweight ranking formula to calculate the relevance of a piece of content: $$Score = \frac{\sum (Weight_{signal} \cdot Count_{signal})}{Age^\gamma} \cdot Similarity(UserVector, ContentVector)$$ where $\gamma$ is the gravity/decay constant. 6. Build a "Batch Re-Ranker": When the SocialSyncManager fetches a list of posts, the engine must sort them according to the active user's Interest Vector before delivery. 7. Integrate with the SentimentTracker: Ensure that if a user is in a "Negative" emotional state, the engine prioritizes high-empathy or calming content over high-intensity debate.

CONSTRAINTS
Do NOT use heavy external ML frameworks like TensorFlow or PyTorch for the primary ranking loop; the math must be handled using native Float32Array operations to ensure <10ms latency. The personalization data must be strictly anonymized-store only behavioral hashes, never raw PII. The engine must be "Self-Correcting"-if a user's engagement drops, it should automatically increase the "Exploration Factor" to find new interest clusters.

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