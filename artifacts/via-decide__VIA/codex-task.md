You are working in repository via-decide/VIA on branch main.

MISSION
Implement an intelligent long-term memory and Retrieval-Augmented Generation (RAG) system called via-vector-memory. 1. Create src/core/ai/memory/. 2. Implement DocumentProcessor.ts to chunk large incoming PDFs, codebases, or plain text into semantically meaningful segments. 3. Create EmbeddingGenerator.ts to convert text chunks into high-dimensional vector arrays. 4. Implement VectorDatabase.ts using a fast similarity search engine (like pgvector or Pinecone) to store and retrieve contextual embeddings. 5. Build a SemanticSearch.ts module to intercept user queries, search the vector DB for context, and prepend the retrieved data to the LLM's system prompt.

CONSTRAINTS
Ensure embeddings are cached to prevent redundant API calls. The search pipeline must execute in under 200ms to avoid degrading the conversational latency.

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
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st

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