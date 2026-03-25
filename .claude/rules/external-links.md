# rules/external-links.md — External Link Safety

Claude Code MUST read this before writing any `<a>` tag or navigation call.

## 1. THE ONE RULE
Every link that leaves `viadecide.com` MUST have: `target="_blank" rel="noopener noreferrer"`. No exceptions.

## 2. WHAT COUNTS AS EXTERNAL
- Any `href` starting with `https://` or `http://`.
- Any `href` pointing to:
  - `github.com`
  - `t.me`
  - `via-decide.github.io`
  - `supabase.co`
  - `firebase.google.com`
- Any `window.location.href = url` assignment where `url` is external.
- Any `window.open()` call.

## 3. INTERNAL LINKS (never open in new tab)
- **Tab Switches**: Always `switchTab('tabId')` — never `href`.
- **In-App Drawing/Modal Open**: Always JS handler — never `href`.
- **API Routes**: Always `fetch()` — never `href`.

## 4. window.open() RULE
Replace ALL `window.location.href = externalUrl` with: `window.open(externalUrl, '_blank', 'noopener,noreferrer')`.

## 5. AUDIT PATTERN (for Claude to self-check)
Mentally grep the output for:
1. `href="https://` → must have `target="_blank"` on the same element.
2. `href="http://` → must have `target="_blank"` on the same element.
3. `window.location.href =` → must not be an external URL.

If any violation is found: **FIX IT** before outputting.

## 6. WHY THIS MATTERS IN VIA
VIA is a swipe feed. If the user navigates away, they lose their scroll position, their feed state, and their session context. Every unguarded external link is a user lost.
