Branch: simba/fix-the-world-map-routing-bug-register-subpage-r
Title: Fix the World Map routing bug: Register subpage routes in the central...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Teach the JavaScript router that the map subpages actually exist, so it stops treating them as invalid URLs that need to be redirected to the home platform.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.