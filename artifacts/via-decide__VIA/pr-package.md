Branch: simba/fix-the-world-map-routing-bug-update-map-link-ev
Title: Fix the World Map routing bug: Update Map Link event listeners to pre...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Ensure clicking a map region tells the internal JavaScript router to load the subpage, rather than asking the browser to load a new URL that falls back to the main platform.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.