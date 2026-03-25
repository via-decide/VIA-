Branch: claude/integrate-product-ecosystem
Title: feat: integrate ONDC, MSME Finance, and Inventory Dashboards into Discover & Feed

## Summary
- Repo orchestration task for Bharat's Feed (ViaDecide)
- Goal: Surface existing product subpages (ONDC, MSME Finance, Inventory) into the main UI to enable interactive data-driven decision workflows.

## Changes
### 1. Discover Layer (`viadecide.html`)
- Added **"📈 Product Ecosystem"** section header.
- Registered **MSME Fin Dashboard**, **Inventory Manager**, and **ONDC Hub** cards.

### 2. Main Feed (`viadecide.html`)
- Added a **"Featured Deployment"** card to the top of the swipe deck (ID: 0).

### 3. Deep Dives (`viadecide.html`)
- Injected a dynamic **"Launch Live Dashboard →"** CTA button at the end of story takeaways.
- Updated `ddLoad` engine to toggle the button based on `toolPath` metadata.

### 4. Tool Registry (`nav-registry.json`)
- Formally registered the new tools in the global registry under the **business** category.
- Incremented `totalTools` to 69.

## Testing Checklist
- [ ] Swiped through the feed to verify the new "Featured Deployment" card.
- [ ] Navigated to the Discover layer to check the "Product Ecosystem" grid.
- [ ] Opened ONDC and MSME Deep Dives to verify the "Launch Dashboard" button appears and redirects correctly.
- [ ] Verified that the "Creator" section remains intact and functional.

## Risks
- Direct URL hardcoding in `toolPath` may need adjustment if routing shifts from hash-based to folder-based.

## Rollback
- Revert commits to `viadecide.html` and `nav-registry.json`.
