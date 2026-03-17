You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-cross-agent-knowledge-graph to enable real-time fact-sharing and relational linking across the entire agent swarm. 1. Create a new directory src/core/memory/knowledge-graph/. 2. Create graph-config.json defining "Entity Types" (User, Project, Concept, Emotion), "Relation Types" (OWNS, LIKES, CREATED, RELATED_TO), and "Confidence Decay" parameters for unverified facts. 3. Implement GraphManager.js (or .ts). This module must manage a high-performance, in-memory Directed Acyclic Graph (DAG) or Adjacency List representing the swarm's collective "worldview." 4. Build the "Fact Ingestion Pipeline": When an agent extracts a fact from a conversation (e.g., "User @dev0x has a deadline on Friday"), it must emit a KnowledgeTriple (Subject-Predicate-Object) to the EventBus. 5. Implement "Conflict Resolution": If two agents report contradictory facts (e.g., Agent A says "Project is Live," Agent B says "Project is Paused"), the Graph Manager must use the ReputationScorer and timestamp metadata to determine the "Canonical Truth." 6. Build "Inference Triggers": When a new node is added, the engine should automatically check for 2nd-degree connections (e.g., If A knows B, and B knows C, suggest A might be interested in C) and notify relevant agents. 7. Integrate with SearchEngine: Allow the via-distributed-search-indexer to query the graph for relational context during full-text searches.

CONSTRAINTS
Do NOT use external graph databases like Neo4j or ArangoDB. You must implement a native JavaScript graph structure optimized for rapid traversal. Use Uint32Array or Map-based adjacency lists to keep traversal costs at $O(E/V)$ where $E$ is edges and $V$ is vertices. The graph must be periodically serialized to the LocalVectorStore to prevent data loss on restart.

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