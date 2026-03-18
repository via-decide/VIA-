Branch: simba/based-on-ux-review-of-the-live-feed-we-need-to-e
Title: Based on UX review of the live feed, we need to execute a "Cinematic ...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Eliminate all UI clipping on standard mobile viewports. By moving the progress indicator to the top (Story style) and pushing the action buttons up, we give the user's thumb more breathing room and create a polished, clutter-free reading experience that rivals native iOS apps.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.