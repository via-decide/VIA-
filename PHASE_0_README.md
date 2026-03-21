# Phase 0: ViaDécide Repository Consolidation Planning

## Mission Overview
This phase marks the beginning of the **ViaDécide Consolidation Mission**. The goal is to audit 44+ fragmented repositories and prepare the ground for a unified monorepo at `www.viadecide.com`.

## Phase 0 Deliverables
The following artifacts have been generated in the `/outputs` directory:

| Deliverable | Description |
| :--- | :--- |
| `inventory-dashboard.html` | Interactive UI to browse and filter the 44+ repos. |
| `migration-checklist.html` | Interactive checklist for per-repo migration status. |
| `phase-0-status-dashboard.html` | High-level progress dashboard for Phase 0. |
| `setup-monorepo.sh` | Bash script to initialize the local monorepo structure. |
| `init-monorepo.js` | Node.js script to populate the monorepo with tool directories. |
| `repos-inventory.json/csv` | Structured data of all catalogued repositories. |
| `nav-registry-template.json` | Template for the unified navigation registry. |

## Next Steps: Phase 1
Once Phase 0 is reviewed and the Telegram bot completes the initial Git operations (repo archiving, monorepo creation), we move to Phase 1: **Core Infrastructure**.

1. **Deploy Shell**: Initialize the monorepo root and deploy the shell (`/shell`).
2. **Implement Router**: Finalize `router.js` to handle `/tool/{id}` navigation.
3. **Migrate High-Impact Tools**: Begin Batch 1 migration (decide.engine-tools, etc.).

## Support
For architectural questions, consult the `VIADECIDE_CONSOLIDATION_BLUEPRINT.md`.
For setup issues, see `MONOREPO_SETUP_README.md`.
