Branch: simba/fix-the-submodule-data-sync-blockade-cors-sessio
Title: Fix the submodule data-sync blockade (CORS & Session passing). 1. In ...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Allow Orchade to read the user's Google ID securely without requiring a second login prompt inside the submodule.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.