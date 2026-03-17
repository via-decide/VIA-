You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-context-pruning-engine to intelligently manage agent memory by trimming low-signal data while preserving the "semantic thread" of long-running conversations. 1. Create a new directory src/core/memory/context-pruner/. 2. Create pruning-config.json defining "Hard Token Limits" for different model tiers, "Salience Thresholds," and a list of "Immortal Tags" (e.g., #UserIdentity, #CoreGoal) that must never be pruned. 3. Implement PruningManager.js (or .ts). This module must intercept the context window payload before it is dispatched to the PredictiveEngine. 4. Build a "Salience Scorer": Instead of a simple FIFO (First-In-First-Out) truncation, use a lightweight scoring algorithm to rank conversation turns. $$Score = (Relevance \cdot \omega_1) + (Recency \cdot \omega_2) + (Density \cdot \omega_3)$$ where "Density" identifies turns with high factual or instructional content. 5. Implement "Recursive Summarization": For segments identified as "Low-Salience but Historical," trigger a background task to condense multiple turns into a single "Memory Anchor" string (e.g., "User previously discussed project X but moved on to Y"). 6. Integrate with LocalVectorStore: Ensure that any "Pruned" content is not deleted but is instead indexed into the long-term vector memory so it can be retrieved via RAG if the conversation loops back to those topics. 7. Add a "Token Budget Watchdog": Monitor the real-time token count and dynamically adjust the pruning aggressiveness if the model's context limit is approached (e.g., within 15% of the limit).

CONSTRAINTS
Do NOT use external LLMs for the pruning/scoring logic itself; it must be handled locally using token-counting (like tiktoken bindings) and native string analysis to ensure <30ms overhead. The "Summarization" step must be non-blocking and happen out-of-band to prevent adding latency to the primary response. Ensure "System Prompts" and "Identity Metadata" are protected from the pruner at all times.

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