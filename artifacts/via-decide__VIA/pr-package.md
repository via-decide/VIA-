Branch: simba/fix-the-world-map-routing-bug-implement-a-robust
Title: Fix the World Map routing bug: Implement a robust 404 / Deep Linking ...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Fix the environment-level routing so that direct links and page refreshes maintain the user's location on the map.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.