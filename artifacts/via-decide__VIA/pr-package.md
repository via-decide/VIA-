Branch: simba/build-a-urlresolver-utility-to-permanently-safeg
Title: Build a URLResolver utility to permanently safeguard against GitHub P...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Create an environment-aware pathing system so developers never have to worry about the difference between localhost routing and GitHub Pages routing again.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.