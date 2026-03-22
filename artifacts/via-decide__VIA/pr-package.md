Branch: simba/backend-integration-for-orchade-module-1-set-up-
Title: Backend Integration for Orchade Module. 1. Set up a reverse-proxy rou...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Backend Integration for Orchade Module. 1. Set up a reverse-proxy route from 'viadecide.com/orchade' to the Orchade hub. 2. Implement the '/api/sync/orchade' endpoint that persists MBB (Mind, Body, Breath) telemetry from the user session into the main Cohort database.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.