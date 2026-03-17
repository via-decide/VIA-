Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-viral-trend-predictor to proactively identify and position agents within emerging social conversations before they reach peak velocity. 1. Create a new directory src/core/analysis/trend-predictor/. 2. Create trend-config.json defining "Viral Thresholds" (e.g., 200% increase in keyword frequency over 10 mins), "Sentiment Volatility" triggers, and a list of "High-Signal Sources" (e.g., top-tier influencers or news feeds). 3. Implement PredictorEngine.js (or .ts). This module must consume the normalized SocialEvent stream from the SocialSyncManager. 4. Build a "Velocity & Acceleration" Calculator: Use a derivative-based approach to measure the rate of change for specific topics or hashtags. $$Velocity (V) = \frac{\Delta Mentions}{\Delta Time}$$ $$Acceleration (A) = \frac{\Delta V}{\Delta Time}$$ 5. Implement "Topic Clustering": Use a lightweight, string-distance-based clustering algorithm (e.g., Levenshtein or Jaccard Similarity) to group related mentions into a single "Trend Candidate" without needing a full vector embedding for every tweet. 6. Build an "Engagement Strategy" Generator: When a trend is confirmed, the engine should notify the PredictiveRouter to spawn or re-task an agent with a specific "Trend-Context" prompt to maximize "First-Mover" visibility. 7. Integrate with BudgetRebalancer: Ensure that the swarm only "bets" its compute resources on trends with a high probability of sustained engagement to avoid wasting tokens on "Flash-in-the-pan" noise.

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