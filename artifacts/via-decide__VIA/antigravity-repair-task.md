Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-resource-auctioneer to manage compute priority and API quotas through an internal, market-driven bidding system. 1. Create a new directory src/core/infrastructure/resource-auctioneer/. 2. Create auctioneer-config.json defining "Base Credit Allocations" (per agent/tier), "Reserve Prices" for different resources (e.g., GPT-4o calls vs. local Llama-3-8B), and "Auction Windows" (e.g., every 500ms). 3. Implement AuctionEngine.js (or .ts). This module must manage the "Bid-to-Execute" lifecycle within the WorkerPool. 4. Build a "Virtual Credit Ledger": Maintain a high-speed, in-memory balance for every agent. Credits are earned through high "Reputation Scores" and spent on compute cycles. 5. Implement "Priority Preemption": If a "High-Urgency" agent outbids an active "Background" agent, the engine must gracefully pause/checkpoint the lower-priority task and reallocate the worker thread. 6. Build the "Bidding Logic": Agents use their ContextPruning and TrendPredictor data to decide how much to "bid" for a specific turn, based on the perceived value of the interaction. 7. Integrate with SystemTelemetry: Provide a real-time "Cost-per-Interaction" metric to the dashboard to visualize how the swarm is self-allocating its budget.
We need to replace the static CARDS array with a dynamic, self-learning "VibeRank" feed engine. The feed must learn what the user likes based on their gestural intent (Swipe Right vs. Swipe Left) and read time, processing the algorithm entirely on the client side for maximum privacy and zero latency. Step 1: Create a Web Worker file src/core/algo/VibeRankWorker.js. Step 2: Implement the Affinity Matrix. The worker should maintain a local score for each category (e.g., Tech, Bharat, Sport). - Swipe Right (Affirmation): +5 points to category affinity. - Swipe Left/Up fast (Skip): -2 points. - Open & Read > 15 seconds (Deep Engagement): +10 points. Step 3: Build the FeedQueue manager in index.html. Instead of loading all cards at once, the main thread should request a "batch" of 5 cards from the Web Worker. Step 4: The Web Worker will fetch the raw, unsorted JSON feed from Supabase (or the mock data file), sort it based on the user's current Affinity Matrix, and post the sorted batch back to the main thread to be injected into the DOM dynamically. Step 5: Implement "Infinite Deck" logic. When currentCard reaches CARDS.length - 2, trigger the Web Worker to silently calculate and append the next batch of 5 cards to the DOM without interrupting the user's current swipe animation.

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