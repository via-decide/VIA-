# Architecture

## Preservation-first mesh

The repository uses an additive mesh architecture:

- legacy standalone tools remain runnable,
- modular tools remain standalone,
- new engine tools are added under `tools/engine`.

## Tool categorization

Tools are organized into 9 logical categories. Category assignment is metadata-driven via each tool's `config.json` and normalized by the registry's `CATEGORY_MAP`.

| Category | Label | Description |
|---|---|---|
| creators | Creators | Prompting, scripting, content generation |
| coders | Coders | Code generation, review, app building |
| researchers | Researchers | Multi-source research, synthesis |
| business | Business | Sales, decisions, founder tools, specs, exports |
| education | Education | Interview prep, student research, quizzes |
| games | Games | Interactive quizzes and game tools |
| simulations | Simulations | Orchard Engine tools (all layers) |
| system | System | Tool router, infrastructure |
| misc | Misc | Uncategorized or experimental |

Physical category directories exist under `tools/` for forward compatibility. Currently, tools remain in their original locations and are virtually categorized via the registry.

## File layout

```
index.html                         ← hub page, renders tools by category
router.js                          ← section nav + ?tool= deep-link resolver
shared/                            ← shared utilities
  tool-registry.js                 ← tool discovery, category mapping, loadAll()
  tool-storage.js                  ← localStorage wrapper
  tool-bridge.js                   ← inter-tool context handoff
  shared.css                       ← dark UI primitives
  engine-utils.js                  ← engine parsing/scoring
  engine-models.js                 ← engine calculation models
  simulation-utils.js              ← Wave 1 simulation helpers
  engine-balance.js                ← Wave 1 balance analysis helpers
{tool}/                            ← root-level legacy tools (self-contained)
  index.html
  config.json
tools/{tool}/                      ← modular tools (use shared utilities)
  index.html
  config.json
  tool.js
tools/engine/{tool}/               ← Orchard Engine tools
  index.html
  config.json
  tool.js
tools/{category}/                  ← category directories (forward-compatible)
  .gitkeep
```

## Tool resolution

The router resolves tool IDs in this order:

1. Static path map (covers all 44 tools by ID)
2. Direct path (if the reference contains `/`)
3. Async fallback to `ToolRegistry.findById()`
4. Error display if not found

## Orchard engine layering

### Layer 1: Farm
Write-heavy player progression workflows:

- signup,
- farm generation,
- growth calculators,
- daily quest generation,
- weekly harvest,
- monthly promotion.

### Layer 2: Commons
Trust and collaboration:

- seed exchange,
- fruit sharing,
- circles,
- peer validation,
- trust scoring.

### Layer 3: Market
Read-heavy recruiter workflows:

- recruiter dashboard,
- discovery search,
- hire readiness scoring.

## Wave 1 simulation layer

Simulation tools validate Layer 1 fairness before expansion:

```
tools/engine/synthetic-player-generator/   ← generate test players
tools/engine/wave1-simulation-runner/      ← run 30/60/90-day simulations
tools/engine/balance-dashboard/            ← analyze fairness verdict
shared/simulation-utils.js                 ← simulation helpers
shared/engine-balance.js                   ← balance analysis helpers
```

The original `tools/engine/simulation-runner/` is preserved unchanged.

## Scalability orientation (100k players)

- separate read-heavy recruiter views from write-heavy gameplay loops,
- precompute leaderboard/profile summaries during timed jobs,
- run periodic jobs for weekly harvests, 15-day reviews, and 30-day promotions,
- keep AI coaching advisory and decoupled from ranking writes,
- keep simulations isolated from live player state.

## Shared components

- `tool-registry.js`: metadata-driven discovery across legacy/modular/engine tools.
- `tool-storage.js`: local persistence.
- `tool-bridge.js`: lightweight inter-tool context exchange.
- `engine-utils.js`: parsing/scoring utilities.
- `engine-models.js`: baseline engine calculations per mini-tool.
- `simulation-utils.js`: Wave 1 player generation and simulation.
- `engine-balance.js`: Wave 1 balance analysis and fairness metrics.

## Metadata contract

Each tool config supports:

- id
- name
- description
- category
- audience
- inputs
- outputs
- relatedTools
- entry
- tags

## How to extend

1. New simulation tools should be added as new folders under `tools/engine/`.
2. Shared helpers should be added as new files under `shared/` — never modify `engine-utils.js` or `engine-models.js` for simulation-specific logic.
3. Layer 2 simulation (commons/trust) should add its own shared helpers (e.g., `shared/commons-simulation.js`).
4. Layer 3 simulation (market/recruiter) should follow the same pattern.
5. The balance dashboard can be extended with new chart blocks without rewriting existing ones.

## Workflow and graph layer (additive)

Additional standalone pages are available at repo root:

- `tool-graph.html` with `shared/tool-graph.js` and `shared/tool-graph.css`
- `workflow-builder.html` with `shared/workflow-ui.js`, `shared/workflow-engine.js`, and `shared/workflow-storage.js`

They consume `ToolRegistry` metadata and do not require modifying existing `tools/*` tool code.
1. Add new tools as new folders — never modify existing tool code.
2. Add shared helpers as new files under `shared/` — never modify existing shared files.
3. Register new tools by adding their path to `importableToolDirs` in `tool-registry.js`.
4. The index page auto-discovers tools from the registry.
5. Category assignment comes from config.json `category` field, normalized by `CATEGORY_MAP`.
