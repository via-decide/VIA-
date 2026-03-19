# Tool Ecosystem Docs

This docs folder describes the preservation-first tool mesh scaffolding.

Primary references are now at repository root:

- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `AGENTS.md`

## Quick note

- Existing standalone tools are preserved.
- Metadata and shared hooks are additive.
- Final category routing is intentionally deferred.
# Via Decide Tool Ecosystem

This repository now contains a modular tool ecosystem under `/tools` where each tool is an independent HTML application.

## Goals

- No manual tool coding for repetitive scaffolding.
- Standalone tool runtime (open `index.html`, no build step).
- Vanilla HTML/CSS/JS only.
- Reusable in this repo and importable into other repos.

## Tool Directories

- `tools/promptalchemy`
- `tools/script-generator`
- `tools/spec-builder`
- `tools/code-generator`
- `tools/code-reviewer`
- `tools/tool-router`
- `tools/export-studio`
- `tools/template-vault`

Each includes:

- `index.html` (UI)
- `tool.js` (logic)
- `config.json` (metadata)

## Shared Utilities

The `/shared` folder provides minimal utilities:

- `shared.css`: reusable dark theme and layout styles.
- `tool-storage.js`: localStorage helpers for persistence.
- `tool-registry.js`: minimal list/registry of available tools.

## Adding a New Tool

1. Create `tools/<tool-id>/`.
2. Add `index.html`, `tool.js`, `config.json`.
3. Reuse `../../shared/shared.css` and `../../shared/tool-storage.js`.
4. Add the tool id to `shared/tool-registry.js`.
5. Include export actions (copy/download) in the UI.

## Current Scope

Tool generation and metadata are implemented.

Category-based routing and advanced orchestration are intentionally deferred to a later phase.
