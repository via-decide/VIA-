You are working in repository via-decide/VIA on branch main.

MISSION
Build "Insight Compression Engine". Create src/core/insight/compression-engine/. Convert long outputs into concise summaries + key bullets. Add Expand/Collapse support. Implement CompressionRatio tracking.

CONSTRAINTS
No external summarization APIs. Rule-based only.
Implement "Context Memory Layer". Create src/core/memory/context-layer/. Store short-lived session context for users. Enable cross-tool continuity (Decision → Study → Execution). Add MemoryPruner.js for cleanup.

CONSTRAINTS
Use lightweight in-memory store. No heavy DB dependency.
Create "Tool Output Normalizer". Create src/core/tools/output-normalizer/. Standardize outputs from all tools into a unified schema. Support text, structured JSON, and hybrid outputs. Implement OutputFormatter.js.

CONSTRAINTS
Avoid deep nesting beyond 3 levels.
Implement "StudyOS Adaptive Path Engine". Create src/modules/studyos/adaptive-engine/. Track user progress and dynamically adjust learning sequences. Use difficulty scaling + time-to-completion heuristics. Add "Knowledge Retention Score" metric.

CONSTRAINTS
No ML models. Use deterministic heuristics only.
Build "Execution Hooks Engine" to make every post actionable. Create src/core/execution/hooks-engine/.

CONSTRAINTS
Hooks must remain stateless and idempotent.
Implement a "Decision Graph Engine" to convert all user inputs into structured reasoning trees. Create src/core/decision/graph-engine/. Define decision-graph.schema.json with nodes: Problem, Options, Constraints, Outcomes. Each node must support weighted edges for probabilistic reasoning. Implement GraphBuilder.js to parse raw prompts into graph structures. Add "Path Confidence Scoring" using weighted traversal logic.

CONSTRAINTS
No external graph libraries. Use adjacency lists with optimized traversal.
Implement the foundational "Feed Intelligence Layer" for VIA to transition from manually curated content to a self-evolving social system. Create directory src/core/feed/intelligence-layer/. Create feed-schema.json defining core post types aligned with VIA's Decision OS: - post_Decision (structured reasoning outputs) - post_StudyPlan (StudyOS generated learning flows) - post_ToolOutput (GN8R-generated execution artifacts) - post_Insight (human-authored frameworks and breakdowns) Implement FeedComposer.js. This module must: - Normalize all incoming content (manual + tool-generated) into a unified post schema - Support expandable structured blocks (sections, steps, code, reasoning layers) - Assign "Execution Hooks" to each post (Run, Modify, Fork actions) Implement ContentOriginTracker.js.

CONSTRAINTS
Do NOT over-engineer real-time infra yet. Use simple JSON store or Supabase-lite mock for persistence. All modules must remain stateless and composable for future agent injection. Feed rendering must support structured content (not plain text blobs).

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