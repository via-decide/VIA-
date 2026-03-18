You are working in repository via-decide/VIA on branch main.

MISSION
Implement a "Decision Graph Engine" to convert all user inputs into structured reasoning trees. Create src/core/decision/graph-engine/. Define decision-graph.schema.json with nodes: Problem, Options, Constraints, Outcomes. Each node must support weighted edges for probabilistic reasoning. Implement GraphBuilder.js to parse raw prompts into graph structures. Add "Path Confidence Scoring" using weighted traversal logic.

CONSTRAINTS
No external graph libraries. Use adjacency lists with optimized traversal.

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