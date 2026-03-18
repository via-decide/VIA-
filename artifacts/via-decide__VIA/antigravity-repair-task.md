Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-gestural-intent-engine to process high-velocity gestural streams and drive predictive resource prefetching. Create directory src/core/ux/gestural-intent-engine/. Create intent-registry.json defining "Radial Action Zones" for buttonless social interactions: zone_Affirmation (Swipe Right): Like/Upvote logic. zone_Curation (Swipe Diagonal-Top-Right): Save/Bookmark logic. zone_Distribution (Swipe Left-Edge): Share/Send context logic. zone_Discovery (Swipe Up): Sequence to next content card. Implement GestureVectorAnalyzer.js. This module must ingest raw touch-point packets (x, y, velocity, pressure) streamed via the SocketMesh. Use the \theta = \operatorname{atan2}(dy, dx) formula to identify the "Intent Quadrant" within the first 40ms of a gesture's initiation. Implement "Predictive Prefetching": If a gesture vector maintains a consistent trajectory (> 90% confidence) and breaches the velocity threshold (0.3 px/ms), immediately signal the PredictiveRouter to warm the target agent's memory and edge cache. Build a "Biometric Vibe Mapper": Correlate swipe pressure variability and speed with the SentimentTracker. High-speed, high-pressure swipes should be classified as "High-Arousal" signals to the TrendPredictor. Integrate with Fault-Tolerance-System: Implement "Speculative Invalidation." If the user changes direction mid-swipe (gesture cancellation), immediately purge the prefetched "Warm Cache" to prevent resource wastage.

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