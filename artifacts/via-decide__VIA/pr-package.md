Branch: simba/implement-a-unified-analytics-service-for-the-en
Title: Implement a unified analytics service for the entire platform. 1. Cre...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Gain deep insights into tool popularity and performance across the monorepo.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.