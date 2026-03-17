Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-local-vector-store to give autonomous agents fast, in-memory semantic search capabilities for their immediate context. 1. Create a new directory src/core/memory/local-vector-store/. 2. Create vector-config.json defining embedding dimensions (e.g., 1536 for standard OpenAI embeddings or 384 for lightweight local models), max vectors per agent, and the similarity threshold. 3. Implement VectorStore.js (or .ts). This module will manage localized, short-term semantic memory for active agents. 4. Build a highly optimized Cosine Similarity or Dot Product search function to calculate the distance between a query vector and the stored memory chunks. 5. Integrate this with the PredictiveEngine and agent runtime. When an agent receives a large prompt or needs to recall recent conversation history, it should query this local store to fetch the most relevant context chunks (RAG - Retrieval-Augmented Generation) before hitting the LLM API. 6. Implement a rolling window (FIFO) eviction policy so the store does not exceed memory limits over long-running sessions.

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