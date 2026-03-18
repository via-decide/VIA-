Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Based on UX review of the live feed, we need to execute a "Cinematic Native Polish" to fix layout clashes and elevate the visual hierarchy of the swipe cards. Step 1: Fix Action Button Overlap (Right Sidebar) - Locate the .card-actions CSS class. - Increase the bottom property from 5rem to 7rem (or calc(5rem + 20px)) so the lowest button (Link/Open) completely clears the bottom navigation bar and its background blur. - Ensure the .action-icon size is strictly 48x48px with perfectly centered SVG/Emoji content. Step 2: Upgrade Progress Indicators (Story-Style) - The vertical progress dots on the right edge (.progress-dots) clash with the action buttons. - Move .progress-dots to the TOP of the card (just below the layer tabs or top status bar). - Transform them from vertical dots into a horizontal "Story Segment" bar (like Instagram/WhatsApp stories).

RULES
1. Audit touched files first and identify regressions.
2. Preserve architecture and naming conventions.
3. Make minimal repairs only; do not expand scope.
4. Re-run checks and provide concise root-cause notes.
5. Return complete contents for changed files only.

SOP: REPAIR PROTOCOL (MANDATORY)
1. Strict Fix Only: Do not use repair mode to expand scope or add features.
2. Regression Check: Audit why previous attempt failed before proposing a fix.
3. Minimal Footprint: Only return contents for the actual repaired files.

REPO CONTEXT
- README snippet:
not found
- AGENTS snippet:
not found
- package.json snippet:
not found