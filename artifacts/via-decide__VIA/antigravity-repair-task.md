Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-predictive-personalization-engine to dynamically rank and tailor social content feeds based on real-time user engagement and behavioral signals. 1. Create a new directory src/core/ux/personalization-engine/. 2. Create personalization-config.json defining "Dopamine Decay" rates (how fast old interests fade), engagement weights (e.g., a "Share" is worth 5x a "Like"), and the "Exploration Factor" (the percentage of novel/random content to inject to prevent echo chambers). 3. Implement PersonalizationEngine.js (or .ts). This module must act as a real-time re-ranking layer for the SocialSyncManager. 4. Build the "Interest Profiler": As users interact with agents or posts, update an ephemeral "Interest Vector" in the EdgeStore. This must be a rolling window to account for "Interest Drift" over time. 5. Implement the "Scoring Logic": Use a lightweight ranking formula to calculate the relevance of a piece of content: $$Score = \frac{\sum (Weight_{signal} \cdot Count_{signal})}{Age^\gamma} \cdot Similarity(UserVector, ContentVector)$$ where $\gamma$ is the gravity/decay constant. 6. Build a "Batch Re-Ranker": When the SocialSyncManager fetches a list of posts, the engine must sort them according to the active user's Interest Vector before delivery. 7. Integrate with the SentimentTracker: Ensure that if a user is in a "Negative" emotional state, the engine prioritizes high-empathy or calming content over high-intensity debate.

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