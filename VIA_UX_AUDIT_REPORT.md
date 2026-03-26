# VIA Platform: UI/UX Audit & Fix Plan

## 1. Prototype Symptoms (Current State)
During the audit of `viadecide.html` and the `VIA-repo` structure, the following "prototype" indicators were identified:

*   **Placeholder Alerts**: Interactive elements like the Store products trigger browser `alert()` boxes instead of integrated UI components. This breaks immersion and looks unfinished.
*   **Static Internal Linking**: Navigation to major sections like the `Business-Directory` uses `window.location.href`, causing full page reloads and losing the SPA (Single Page Application) feel.
*   **Abrasive Protection Logic**: Global `user-select: none` and context menu blocking make the app feel "locked" and hinder legitimate user interactions (e.g., copying a business handle).
*   **Layout Hard-coding**: Key content sections (Store, Deep Dives) rely on hard-coded arrays in internal scripts rather than dynamic configuration files, making updates difficult.
*   **Missing Feed Polish**: The "Thumb Zone Guide" and `pull-indicator` are visible but lack the micro-animations found on the cinematic landing page.

## 2. Bug Report & Technical Debt

| Component | Issue | Impact |
| --- | --- | --- |
| **Navigation** | No cross-layer state persistence on refresh. | Medium (UX) |
| **Store** | `openProduct` is a stub. | High (UX) |
| **UX** | `anti-scraping.js` logic is too aggressive. | Medium (Accessibility) |
| **Performance** | Large `nav-registry.json` (50KB) loaded synchronously. | Medium (LCP) |
| **Onboarding** | No "Skip" or "Previous" logic in the manual swipe guide. | Low (UX) |

## 3. Bulletproof Fix Plan

### Phase 1: Navigation & State (Immediate)
- [ ] **SPA Routing**: Update `via-navigation.js` to use `history.pushState` for layer switching.
- [ ] **Seamless Transitions**: Integrate `via-transition.js` to animate the layer switching (Fade + Scale) instead of immediate `display: none`.
- [ ] **Refine UX Constraints**: Remove global `user-select: none` and replace it with `user-select: text` for content cards.

### Phase 2: Component Hardening
- [ ] **The "VIA Sheet" Engine**: Replace all instance of `alert()` with a call to the existing `.sheet` (Bottom Sheet) system.
- [ ] **Store Infrastructure**: Create a `StoreUI` module that renders technical specs and a "Request Quote" form inside a sheet.

### Phase 3: Visual Polish (Modernization)
- [ ] **Glassmorphic Toasts**: Implement a standardized notification system.
- [ ] **Micro-animations**: Add hover/active scaling states to all `bento-item` and `layer-tab` components to match the high-end landing page.

---
> [!TIP]
> Use the existing `shared/vd-auth.js` session to personalize the `Profile` and `XP` counters immediately upon start.
