You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-gestural-intent-engine to process high-velocity gestural streams and drive predictive resource prefetching. Create directory src/core/ux/gestural-intent-engine/. Create intent-registry.json defining "Radial Action Zones" for buttonless social interactions: zone_Affirmation (Swipe Right): Like/Upvote logic. zone_Curation (Swipe Diagonal-Top-Right): Save/Bookmark logic. zone_Distribution (Swipe Left-Edge): Share/Send context logic. zone_Discovery (Swipe Up): Sequence to next content card. Implement GestureVectorAnalyzer.js. This module must ingest raw touch-point packets (x, y, velocity, pressure) streamed via the SocketMesh. Use the \theta = \operatorname{atan2}(dy, dx) formula to identify the "Intent Quadrant" within the first 40ms of a gesture's initiation. Implement "Predictive Prefetching": If a gesture vector maintains a consistent trajectory (> 90% confidence) and breaches the velocity threshold (0.3 px/ms), immediately signal the PredictiveRouter to warm the target agent's memory and edge cache. Build a "Biometric Vibe Mapper": Correlate swipe pressure variability and speed with the SentimentTracker. High-speed, high-pressure swipes should be classified as "High-Arousal" signals to the TrendPredictor. Integrate with Fault-Tolerance-System: Implement "Speculative Invalidation." If the user changes direction mid-swipe (gesture cancellation), immediately purge the prefetched "Warm Cache" to prevent resource wastage.

CONSTRAINTS
Do NOT use external physics or math libraries. Use native JS Math and Float32Array for all vector calculations to ensure sub-2ms processing time. The logic must support "Soft-Axis Locking"-identifying the dominant interaction axis (Vertical vs Horizontal) within the first 15 pixels of physical movement to reduce cognitive friction.

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