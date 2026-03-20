Branch: simba/implement-a-secure-sandboxed-tool-execution-engi
Title: Implement a secure, sandboxed tool execution engine called via-agent-...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Give the AI swarm actual agency. By providing a secure, heavily constrained environment for code execution and API interactions, the VIA agents transform from passive conversationalists into active digital workers capable of completing complex, multi-system tasks autonomously.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.