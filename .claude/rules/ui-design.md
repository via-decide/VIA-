# rules/ui-design.md — ViaDecide Design System

Claude Code MUST read this before writing any HTML/CSS.

## 1. DESIGN TOKENS (as CSS custom properties)
- **Colors**:
  - `--bg`: `#0d1117`
  - `--surface`: `#161b22`
  - `--surface-2`: `#1c2128`
  - `--border`: `#21262d`
  - `--text`: `#e6edf3`
  - `--muted`: `#7d8590`
  - `--orange`: `#ff671f`
  - `--orange-dim`: `rgba(255, 103, 31, 0.1)`
  - `--error`: `#ff4488`
  - `--success`: `#10b981`
  - `--warning`: `#ffaa00`
- **Spacing**: `--space-1` (4px) through `--space-8` (32px). Base unit = 4px.
- **Typography**: DM Sans (body), Syne (headings). Tight tracking on headings.
- **Motion**:
  - `--duration-fast`: `120ms`
  - `--duration-base`: `220ms`
  - `--duration-slow`: `380ms`
  - Easing: `cubic-bezier(.16,1,.3,1)`
- **Radius**:
  - `--radius-sm`: `8px`
  - `--radius-md`: `12px`
  - `--radius-lg`: `20px`
  - `--radius-pill`: `999px`
- **Z-Index Stack**:
  - `dropdown`: `1500`
  - `bottom-nav`: `1000`
  - `modal-overlay`: `2000`
  - `modal-content`: `2001`
  - `toast`: `3000`
- **Tap Target**: `--tap-min`: `44px` (minimum height/width).

## 2. COMPONENT PATTERNS
- **Card**: Dark surface, border, `radius-md`, padding `space-4`.
- **Bottom Tab Bar**: Fixed bottom, height `64px`, 5 columns, orange active state.
- **Toast Notification**: Fixed bottom-right, slides up, auto-dismiss `3s`.
- **Modal**: Full overlay, card center, close button top-right, ESC key closes.
- **Button Variants**:
  - `primary`: Orange fill, `#fff` text.
  - `secondary`: Border only.
  - `ghost`: No border, orange text.
  - `danger`: Red border or fill.
- **Input Field**: Dark bg, border, focus ring orange, no outline by default.
- **Badge/Pill**: Small, `rounded-pill`, orange or muted.
- **Skeleton Loader**: Animated shimmer, matches shape of real content.

## 3. MOTION RULES
- **Tab Switches**: `200ms` fade (opacity 0→1), no slide (prevents scroll confusion).
- **Card Entry**: `translateY(8px)`→0 + opacity 0→1, `220ms`, `ease-out`.
- **Modal Open**: `scale(0.96)`→1 + opacity 0→1, `220ms`.
- **Toast**: `translateY(20px)`→0, `180ms`, `ease-out`.
- **Reduced Motion**: Honored if user preference is set.

## 4. MOBILE-FIRST RULES
- **Viewports**: Base styles target `375px`.
- **Units**: All font sizes in `rem` (base `16px`).
- **Touch**: Targets minimum `44x44px` (`--tap-min`).
- **Interactive**: No hover-only interactions (must have tap equivalent).
- **Safe Areas**: `padding-bottom: env(safe-area-inset-bottom)` on the bottom navigation bar.
- **Tap Highlight**: `-webkit-tap-highlight-color: transparent` on all buttons.

## 5. TYPOGRAPHY
- **Headings**: `font-weight: 700`, tight tracking (`letter-spacing: -0.02em`).
- **Body**: `font-weight: 400`, `line-height: 1.6`.
- **Labels/Caps**: `font-weight: 600`, uppercase, `letter-spacing: 0.08em`, `font-size: 0.7rem`.
- **Muted Text**: Color `var(--muted)`, never below `4.5:1` contrast on dark.

## 6. WHAT IS NEVER ALLOWED
- **White BG**: No `#fff` or `#f5f5f5` backgrounds (dark theme only).
- **Accent**: No purple, pink, or blue as primary accent — strictly orange.
- **Radius**: No `border-radius` > `24px` on content cards.
- **Shadows**: No `box-shadow` on dark surfaces (use `border` instead).
- **Gradient Text**: Not allowed.
- **Duration**: No durations > `400ms` (sluggish).
- **Weights**: No more than 2 font weights in the same component.
