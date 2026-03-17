# Prototype-to-SkillHex Integration Map

## 1. Extracted thread-input concepts
- The uploaded prototype file is not present in the current workspace, so direct extraction was not possible.
- Use a virtual “thread” abstraction centered on: anchor point, directional pull, drag distance, hold timing, and release-to-commit.
- Treat input as intent inference (confidence-based), not raw pointer movement.

## 2. 12-state behavior summary
- Model commands as a 12-segment radial state machine (30° per segment).
- Segment index is chosen by release angle; command variant can be modified by distance bucket (near/mid/far) and hold duration.
- Keep core states stable (1–12) while remapping labels/actions per game context.

## 3. Gesture interpretation model
- Start: pointer/touch down captures anchor and context.
- Track: compute live vector `(dx, dy)`, angle, radius, velocity, and hold time.
- Infer: pick segment by normalized angle; apply confidence scoring from radius stability + angle jitter + minimum dwell.
- Commit: on release dispatch command if confidence threshold is met; otherwise trigger explicit confirmation fallback.

## 4. UI patterns worth reusing
- Persistent radial wheel with clear segment highlighting.
- Live command preview text near the wheel center.
- Distinct states for idle, aiming, armed, committed, and cancelled.
- Immediate telemetry feedback (“gesture started/completed/fallback”).
- Quick mode toggle (Standard ↔ Thread) always visible.

## 5. What should not be copied directly
- Prototype-specific visual styling, placeholder text, and non-game layout scaffolding.
- Any hardcoded assumptions about a single input device or fixed viewport.
- Any brittle timing constants not normalized for touch vs mouse vs stylus.

## 6. Mapping into SkillHex controls on desktop
- Pointer drag on canvas/panels drives thread wheel selection.
- Mouse wheel or `Q/E` optionally nudges selected segment for precision.
- Keyboard mirrors radial states (`1-9`, `-`, `=`, `0` or arrow rotation + Enter).
- Right-click or `Esc` maps to cancel/back state.

## 7. Mapping into SkillHex controls on mobile/tablet
- Tap-hold-drag-release gesture with enlarged hit zones and thumb-safe placement.
- Floating/docked wheel adapts by orientation and viewport width.
- If drag confidence is low, show large tap targets for confirm/cancel + top 3 likely commands.
- Maintain scroll-safe behavior by only capturing gestures inside active interaction regions.

## 8. Risks and simplifications
- Risk: gesture ambiguity on small screens; simplify by using larger angular dead zones and minimum radius.
- Risk: accidental scroll conflict; simplify with explicit “thread active” latch and `touch-action` tuning.
- Risk: discoverability; simplify with first-run tutorial overlay and replay hint.
- Risk: context overload; simplify by limiting to 6–8 active commands while preserving 12-state internal model.

## 9. Recommended integration plan
1. Add central `InputController` with pluggable modes and unified dispatch.
2. Implement 12-state wheel math + confidence scoring independent of UI.
3. Add thread wheel UI component (responsive, accessible, collapsible).
4. Define context command maps (Landing, Map, Mission, Results, Proof Vault).
5. Wire telemetry events for gesture lifecycle and fallback usage.
6. Run cross-device QA pass (mouse, touch, keyboard, stylus where available).
7. Gate rollout behind default Standard Mode with opt-in Thread Mode.
