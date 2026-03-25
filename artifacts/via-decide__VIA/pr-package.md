Branch: simba/fix-the-404-on-refresh-bug-by-implementing-a-sov
Title: Fix the '404 on Refresh' bug by implementing a Sovereign Reverse Prox...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Ensure deep-linking works. A user must be able to share the URL viadecide.com/mars and have it load perfectly on a fresh browser instance.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.