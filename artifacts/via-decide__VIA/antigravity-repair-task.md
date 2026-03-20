Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement an automated documentation pipeline called via-docs-engine and draft the Master ARCHITECTURE.md to definitively map the AI swarm's infrastructure. 1. Create a new directory docs/architecture/ and a dedicated apps/docs/ workspace for the documentation site. 2. Draft the master ARCHITECTURE.md. This document must comprehensively map the data flow: Client (SDK/CLI) -> via-realtime-bus -> via-model-gateway -> via-agent-swarm -> via-agent-tools & via-vector-memory. 3. Implement DocGenerator.ts. This script must use an Abstract Syntax Tree (AST) parser (like TypeDoc) to scrape all exported TypeScript interfaces, JSDoc comments, and OpenAPI schemas directly from the src/ directory. 4. Generate a static, searchable HTML developer portal using a framework like Docusaurus or VitePress. This portal will serve as the official guide for developers using the via-sdk-core. 5. Include a strict "Security Boundaries" section in the architecture document that explicitly defines the isolation layers between the LLM output, the local execution sandbox, and the host Node.js environment. 6. Hook the DocGenerator into the CI/CD pipeline. Every commit to main must automatically regenerate the SDK API reference and deploy the updated site to Vercel, Cloudflare Pages, or GitHub Pages. 7. Enforce a lint:docs rule in the pre-commit hooks that fails the build if a developer adds a new tool to the ToolRegistry or a new endpoint without providing the required OpenAPI annotations.

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
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st
- AGENTS snippet:
not found
- package.json snippet:
{ "name": "react-example", "private": true, "version": "0.0.0", "type": "module", "scripts": { "dev": "vite --port=3000 --host=0.0.0.0", "build": "vite build", "preview": "vite preview", "clean": "rm -rf dist", "lint": "tsc --noEmit" }, "dependencies": { "@googl