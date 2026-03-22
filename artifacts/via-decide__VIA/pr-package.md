Branch: simba/backend-integration-for-orchade-module-1-set-up-
Title: Backend Integration for Orchade Module. 1. Set up a reverse-proxy rou...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Backend Integration for Orchade Module. 1. Set up a reverse-proxy route from 'viadecide.com/orchade' to the Orchade hub. 2. Implement the '/api/sync/orchade' endpoint that persists MBB (Mind, Body, Breath) telemetry from the user session into the main Cohort database.
Branch: simba/backend-integration-for-mars-module-1-set-up-a-r
Title: Backend Integration for Mars Module. 1. Set up a reverse-proxy (Nginx...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Backend Integration for Mars Module. 1. Set up a reverse-proxy (Nginx/Envoy) route from 'viadecide.com/mars' to the internal IP of the Mars micro-service. 2. Implement the '/api/verify/mars' endpoint that confirms the active Google ID session before granting access to the relativistic physics parameters.
Branch: simba/integrate-mars-exploration-module-into-the-via-c
Title: Integrate 'Mars' exploration module into the VIA Core. 1. Synchronize...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Enable VIA users to launch into the Mars exploration environment directly from the authenticated dashboard.
Branch: simba/integrate-orchade-social-hub-module-as-the-via-g
Title: Integrate 'Orchade' social-hub module as the VIA Global Lobby. 1. Bri...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Establish Orchade as the 'Heart' of the VIA brand, where all 4,478 commits of logic converge into a social experience.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.