Branch: simba/implement-contentfreshnessscorer-for-feed-rankin
Title: Implement ContentFreshnessScorer for feed ranking.

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Keep feed dynamic.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.