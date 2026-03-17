Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-knowledge-graph-linker to manage complex relational data and semantic connections between users, agents, and topics. 1. Create a new directory src/core/memory/knowledge-graph-linker/. 2. Create graph-config.json defining relationship types (e.g., "FOLLOWS", "INTERESTED_IN", "GENERATED_BY", "SIMILAR_TO"), weight decay settings, and maximum graph depth for traversals. 3. Implement GraphEngine.js (or .ts). This module will manage a directed property graph entirely in-memory. 4. Build an Adjacency List structure: Use a combination of Map (for nodes) and Set (for edges) to allow for O(1) lookups of an entity's direct neighbors. 5. Implement a "Relationship Discovery" algorithm: When an agent processes a new interaction, it should be able to link entities (e.g., if a user mentions "Bitcoin" and "Tesla", the engine creates or strengthens a weighted edge between those two topic nodes). 6. Integrate with the LocalVectorStore: Allow "Hybrid Retrieval" where an agent can find nodes that are both semantically similar (via vectors) and relationally connected (via graph edges). 7. Add a "Community Detection" hook: A background task in the WorkerPool should periodically run a simple Label Propagation algorithm to cluster related users or topics into "Interest Tribes."

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