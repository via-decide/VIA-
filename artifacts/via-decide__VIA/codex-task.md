You are working in repository via-decide/VIA on branch main.

MISSION
Implement an automated documentation pipeline called via-docs-engine and draft the Master ARCHITECTURE.md. 1. Create docs/architecture/ and a Docusaurus/VitePress workspace. 2. Draft ARCHITECTURE.md mapping data flow: Client -> Bus -> Gateway -> Swarm -> Tools/Memory. 3. Implement DocGenerator.ts using an AST parser to scrape exported TypeScript interfaces and OpenAPI schemas directly from src/. 4. Include a strict "Security Boundaries" section defining isolation layers between LLM outputs and the Node host. 5. Enforce a lint:docs rule in pre-commit hooks to fail builds if new tools lack OpenAPI annotations.

CONSTRAINTS
Do NOT rely on manually updated API wikis. The docs pipeline MUST automatically derive the source of truth directly from TS types and Zod schemas.

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