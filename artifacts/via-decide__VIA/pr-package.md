Branch: simba/fix-the-world-map-routing-bug-implement-a-robust
Title: Fix the World Map routing bug: Implement a robust 404 / Deep Linking ...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Fix the environment-level routing so that direct links and page refreshes maintain the user's location on the map.
Branch: simba/fix-subpage-card-routing-on-indexhtml-convert-ab
Title: Fix Subpage Card routing on index.html: Convert absolute paths to rel...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Stop the browser from breaking out of the /VIA/ GitHub Pages repository subdirectory when a user clicks a card.
Branch: simba/implement-global-click-interception-for-subpage-
Title: Implement global click interception for Subpage Cards to prevent defa...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Take control of the routing process away from the browser's default behavior, forcing all card clicks to stay within your application's logic.
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