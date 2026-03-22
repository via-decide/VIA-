Branch: simba/backend-integration-for-mars-module-1-set-up-a-r
Title: Backend Integration for Mars Module. 1. Set up a reverse-proxy (Nginx...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Backend Integration for Mars Module. 1. Set up a reverse-proxy (Nginx/Envoy) route from 'viadecide.com/mars' to the internal IP of the Mars micro-service. 2. Implement the '/api/verify/mars' endpoint that confirms the active Google ID session before granting access to the relativistic physics parameters.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.