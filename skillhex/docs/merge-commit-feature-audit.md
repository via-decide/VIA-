# Merge Commit Feature Audit (SkillHex Mission Control)

This file maps notable merge commits to their primary feature themes, then lists what still needed tightening in `index.html` before upstream integration.

## Merge commits and feature themes

| Merge commit | Feature theme captured from commit history | Notes |
|---|---|---|
| `f8d4c3c` (PR #6) | Upgraded `index.html` toward app-style SkillHex UI | Early single-file app consolidation. |
| `a51ac4b` (PR #7) | SkillHex mission upgrades in UI/interaction layer | Mission controls and UX scaffolding improvements. |
| `8441d4b` (PR #8) | Mission system → simulation engine upgrade | Basis for richer mission state and runtime loop. |
| `bd9e4fc` (PR #9) | Player skill tracking platform baseline | Introduced progression-oriented gameplay loop. |
| `41bb83a` (PR #10) | Player tracking refinements | Follow-up fixes/adjustments on tracking platform. |
| `437a46a` (PR #11) | Additional player tracking refinements | Stability and UX polish wave for platform features. |
| `e30c98e` (PR #12) | SkillHex progression enhancements | XP/SR progression maturity wave. |
| `98f7252` (PR #13) | Progression enhancement follow-up | Additional balancing and implementation adjustments. |
| `8c207cd` (PR #14) | Progression enhancement follow-up #2 | Latest merge wave before interview embedding work. |

## Missing/fragile items found after prior interview merge

1. Warm-up multiplier path was not fully operational end-to-end (prior warm-up answers were not persisted with a stable warm-up marker).
2. Warm-up flow was not actually interactive/skippable in mission UI; it was only shown as a text hint.
3. KADA interview-mode sector mapping was category-first, not “4 sectors = 4 interview rounds” as specified.
4. Integration handoff into `decide.engine` main website repo was not documented as a reproducible merge playbook.

## Plan applied in current patch

1. Add interactive **Mission Pre-Brief** UI (textarea + Apply + Skip) with visible multiplier and follow-up hint.
2. Persist warm-up answers into interview transcript/answers (`fromWarmup: true`) so passive round progress actually accumulates.
3. Rewire KADA interview mode so sectors map to rounds `V07/V08/V09/V10`, with pull action retained for skip question.
4. Add explicit `decide.engine` integration runbook + repo sync strategy docs (no binary artifacts).
