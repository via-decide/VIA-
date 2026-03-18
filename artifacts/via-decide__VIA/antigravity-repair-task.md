Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Build "Execution Hooks Engine" to make every post actionable. Create src/core/execution/hooks-engine/.
Implement a "Decision Graph Engine" to convert all user inputs into structured reasoning trees. Create src/core/decision/graph-engine/. Define decision-graph.schema.json with nodes: Problem, Options, Constraints, Outcomes. Each node must support weighted edges for probabilistic reasoning. Implement GraphBuilder.js to parse raw prompts into graph structures. Add "Path Confidence Scoring" using weighted traversal logic.
Implement the foundational "Feed Intelligence Layer" for VIA to transition from manually curated content to a self-evolving social system. Create directory src/core/feed/intelligence-layer/. Create feed-schema.json defining core post types aligned with VIA's Decision OS: - post_Decision (structured reasoning outputs) - post_StudyPlan (StudyOS generated learning flows) - post_ToolOutput (GN8R-generated execution artifacts) - post_Insight (human-authored frameworks and breakdowns) Implement FeedComposer.js. This module must: - Normalize all incoming content (manual + tool-generated) into a unified post schema - Support expandable structured blocks (sections, steps, code, reasoning layers) - Assign "Execution Hooks" to each post (Run, Modify, Fork actions) Implement ContentOriginTracker.js.

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