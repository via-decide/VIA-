You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-knowledge-graph-linker to manage complex relational data and semantic connections between users, agents, and topics. 1. Create a new directory src/core/memory/knowledge-graph-linker/. 2. Create graph-config.json defining relationship types (e.g., "FOLLOWS", "INTERESTED_IN", "GENERATED_BY", "SIMILAR_TO"), weight decay settings, and maximum graph depth for traversals. 3. Implement GraphEngine.js (or .ts). This module will manage a directed property graph entirely in-memory. 4. Build an Adjacency List structure: Use a combination of Map (for nodes) and Set (for edges) to allow for O(1) lookups of an entity's direct neighbors. 5. Implement a "Relationship Discovery" algorithm: When an agent processes a new interaction, it should be able to link entities (e.g., if a user mentions "Bitcoin" and "Tesla", the engine creates or strengthens a weighted edge between those two topic nodes). 6. Integrate with the LocalVectorStore: Allow "Hybrid Retrieval" where an agent can find nodes that are both semantically similar (via vectors) and relationally connected (via graph edges). 7. Add a "Community Detection" hook: A background task in the WorkerPool should periodically run a simple Label Propagation algorithm to cluster related users or topics into "Interest Tribes."

CONSTRAINTS
Do NOT use external graph databases like Neo4j, ArangoDB, or RedisGraph. You must implement the graph logic using native JavaScript data structures. To handle millions of edges without OOM (Out-of-Memory) errors, use TypedArrays or a memory-efficient buffer for storing edge weights and IDs. Graph traversals (BFS/DFS) must be non-blocking and depth-limited to prevent event-loop starvation.

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