Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-social-sync-manager to manage multi-platform content distribution and real-time data ingestion across X (Twitter), Threads, and Farcaster. 1. Create a new directory src/core/integration/social-sync/. 2. Create sync-config.json defining platform-specific constraints: Character limits (e.g., 280 for X vs 10k for Farcaster), media requirements, rate-limiting tiers, and OAuth/Signer refresh intervals. 3. Implement SyncManager.js (or .ts). This module must act as the primary "Gateway" between the internal AI swarm and the external social web. 4. Build an "Omni-Format" Pipeline: When an agent publishes a post to the EventBus, the Sync Manager must automatically transform the content into the correct schema for each target platform (e.g., converting Markdown to Farcaster-specific mentions or X-style threads). 5. Implement "Unified Stream Ingestion": Aggregate mentions, replies, and keywords from all platforms into a single, normalized SocialEvent stream that the PredictiveRouter can dispatch back to the agents. 6. Build "Rate-Limit Intelligence": Use a token-bucket algorithm to ensure that the swarm never exceeds platform APIs. If one platform (like X) hits a limit, the manager must queue the posts and allow the other platforms (like Farcaster) to continue syncing. 7. Integrate with BlockchainNotary: For platforms like Farcaster or Lens, ensure that the cryptographic signatures of the agents are correctly attached to the metadata before broadcast.

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