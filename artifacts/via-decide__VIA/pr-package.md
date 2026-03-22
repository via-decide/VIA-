Branch: simba/integrate-mars-exploration-module-into-the-via-c
Title: Integrate 'Mars' exploration module into the VIA Core. 1. Synchronize...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Enable VIA users to launch into the Mars exploration environment directly from the authenticated dashboard.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.