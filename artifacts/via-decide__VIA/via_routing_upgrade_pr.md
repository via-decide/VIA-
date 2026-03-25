# PR — VIA Platform 2026 Reinvention (Routing & Landing)

Branch: `claude/setup-via-repositories-3TYyg` (Ready for merge/verification)
Title: `feat: implement cinematic landing and SPA routing fixes`

## ✦ Summary
This PR completes the 2026 architecture for VIA by establishing a high-fidelity entry point and stabilizing the mobile SPA navigation layer.

### 1. Cinematic Landing Integration
- **Relocated Primary UI**: The 5-frame scroll-snap landing page is now the root `index.html`, serving as the "Front Door" to the ecosystem.
- **SPA Platform Migration**: The main social feed and dashboard have been moved to `via-decide.html`.
- **Integrated Call-to-Action**: The "Enter VIA →" button on the landing page now links directly to the SPA.

### 2. Fixed SPA Routing (The "Redirect Issue")
- **Internal Routing Logic**: Implemented `window.onpopstate` and `window.history.pushState` in `via-decide.html` to intercept the hardware/browser back button.
- **The Result**: Navigating through layers (e.g., Tools → Explore → Feed) now works natively. Pressing "Back" returns the user to the previous SPA layer instead of freezing the UI or escaping to external browser history.
- **Deep Linking**: Enhanced `switchLayer` to handle URL parameters (`?layer=tools`), enabling the app to start directly into specialized views.

### 3. Mobile UI & Experience Cleanup
- **Splash (Boot) Screen Optmization**: Added high-fidelity CSS and a `.fade-out` trigger to the splash screen. This prevents the "UI Flash" (where sidebars or about panes were visible before JS initialization).
- **Tab Sanitation**: Hydro-dynamic CSS now hides the redundant top navigation tabs (`.layer-tabs`) on mobile viewports (<600px), prioritizing the bottom nav bar.
- **Back-to-Feed Bridge**: Injected branding and a "← BACK TO FEED" link into the migrated Kutch Business Directory.

### 4. Core Infrastructure
- **Redirect Mappings**: Updated `_redirects` to route `/app` and `/app/` cleanly to the new `via-decide.html` SPA.

## ✦ Files Changed
- `index.html` (Landing)
- `via-decide.html` (Main SPA)
- `style-landing.css`, `script-landing.js` (Entry point assets)
- `_redirects` (Routing rules)
- `pages/directory/*` (Branding & Nav)

## ✦ Testing Checklist
- [x] **Landing → App**: Verify the "Enter VIA" button correctly loads the SPA.
- [x] **Splash Sequence**: Verify the Splash screen shows, then fades out smoothly to reveal the Feed.
- [x] **SPA Back-Button**: Open a Tool Viewer, then press the browser back button. **Expect**: Tool Viewer closes, returns to Tools list.
- [x] **Mobile UI**: Inspect on mobile (375px). **Expect**: Top tabs (Feed/Explore/Tools) are hidden; Bottom nav is active.
- [x] **Redirects**: Access `viadecide.com/app`. **Expect**: Loads the social feed.

## ✦ Rollback
- Rename `via-decide.html` back to `index.html`.
- Revert the `_redirects` file additions.
- Delete `style-landing.css` and `script-landing.js`.

---
*Created by Antigravity AI · March 2026*
