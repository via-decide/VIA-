# VIA import map

This document records the selective migration work from `via-decide/decide.engine` and `via-decide/decide.engine-tools` into this repository.

## Classification legend

- `KEEP_AS_IS` — already present in VIA and reused without signature changes.
- `ADAPT_FOR_VIA` — imported concept or file pattern, then normalized for VIA paths/runtime.
- `IGNORE` — source file reviewed but intentionally not brought in because it conflicts with VIA direction or current repo protections.
- `TOOL_SOURCE_ONLY` — source of reusable tool logic/patterns, not copied as a standalone page shell.

## decide.engine

| Source file | Destination file | Classification | Why kept / why skipped |
|---|---|---|---|
| `404.html` | `404.html` | `ADAPT_FOR_VIA` | Reintroduced the redirect-safe 404 pattern with a relative fallback so static hosting keeps direct page intents. |
| `_headers` | `_headers` | `ADAPT_FOR_VIA` | Brought over stable cache/security header patterns without touching protected routing config. |
| `js/viadecide-agent.js` | `js/viadecide-agent.js` | `ADAPT_FOR_VIA` | Reused route-catalog and launcher ideas while preserving VIA’s lightweight `window.VIAAgent` API. |
| `decision-brief.html` | `decision-brief.html` | `ADAPT_FOR_VIA` | Migrated the strongest constraint-first brief framing into a VIA-native direct subpage with local persistence and tool handoff. |
| `StudyOS.html` | `StudyOS.html` | `ADAPT_FOR_VIA` | Added a direct launcher for the StudyOS workspace so VIA gets the same subpage-first entry pattern. |
| `app-generator.html` | `app-generator.html` | `ADAPT_FOR_VIA` | Preserved the standalone generator surface idea, but rewired launch actions to local VIA tools instead of old repo assumptions. |
| `finance-dashboard-msme.html` | `finance-dashboard-msme.html` | `ADAPT_FOR_VIA` | Kept the MSME planning surface as a standalone page while simplifying it for static-friendly local persistence. |
| `alchemist.html` | `alchemist.html` | `ADAPT_FOR_VIA` | Imported the quiz surface concept and added a VIA-safe fallback dataset so it works even without upstream injection. |
| `about.html` | `about.html` | `IGNORE` | VIA already had a creator/social-aware about page; only imported surface catalogs were merged into the current page. |
| `agent.html` | `agent.html` | `ADAPT_FOR_VIA` | VIA kept its newer agent surface, then integrated imported launchers and source-layer visibility instead of replacing the page wholesale. |
| `_redirects` | _not modified_ | `IGNORE` | Explicitly protected in this repo; existing routing rules were left untouched. |
| `functions/api/*` | _not imported_ | `IGNORE` | Current task prioritized static pages and shared browser runtime, not backend endpoint migration. |
| `blogs/*` and `docs/*` | _not imported_ | `IGNORE` | Useful reference material, but not required for this subpage/tool integration pass. |

## decide.engine-tools

| Source file | Destination file | Classification | Why kept / why skipped |
|---|---|---|---|
| `shared/tool-bridge.js` | `shared/tool-bridge.js` | `KEEP_AS_IS` | Already present in VIA and kept as the cross-tool handoff layer. |
| `shared/tool-registry.js` | `shared/tool-registry.js` | `KEEP_AS_IS` | Already present in VIA and reused as the tool-discovery backbone. |
| `shared/tool-storage.js` | `shared/tool-storage.js` | `KEEP_AS_IS` | Already present and retained as the common storage/logging helper. |
| `shared/workflow-ui.js` | `shared/workflow-ui.js` | `TOOL_SOURCE_ONLY` | Stays as the reusable UI layer for the built-in pipeline tools. |
| `tools/context-packager/*` | `tools/context-packager/*` | `TOOL_SOURCE_ONLY` | Used as the local destination for brief/tool handoff rather than rebuilding a new packager. |
| `tools/code-generator/*` | `tools/code-generator/*` | `TOOL_SOURCE_ONLY` | Reused as the downstream implementation surface for app-generator handoff. |
| `tools/export-studio/*` | `tools/export-studio/*` | `TOOL_SOURCE_ONLY` | Used as the export destination for the imported decision-brief flow. |
| `tools/*` broad catalog | Existing `tools/` tree | `KEEP_AS_IS` | VIA already contains the tool repo’s shared patterns/assets, so this migration relied on them rather than duplicating page shells. |

## Bridge layer

| File | Purpose |
|---|---|
| `js/via-source-bridge.js` | Registers imported surfaces, exposes reusable tool-source metadata, normalizes launch paths, and hydrates about/agent catalog sections. |

## Notes

- VIA-specific creator pages were preserved as-is and remain first-class entry points.
- No protected files under the repo rules were edited except safe additions to non-protected files.
- Tool modules continue to come from the existing `tools/` and `shared/` layers already sourced from `decide.engine-tools`.
