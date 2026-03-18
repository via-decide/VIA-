Branch: simba/build-insight-compression-engine-create-srccorei
Title: Build "Insight Compression Engine". Create src/core/insight/compressi...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Improve readability of dense outputs in feed.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.