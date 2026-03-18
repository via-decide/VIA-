Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
We need to replace the external tool redirects on the social feed cards with a native, in-app "Story Reader" modal that displays actual Hindi/Hinglish content. Step 1: Create a data file src/data/mock-stories.json (or embed it as a const MOCK_STORIES array in the main JS file if a bundler isn't set up yet). Populate it with the 5 realistic Bharat-focused story payloads (Mumbai street food, Bihar AgriTech, IIT AI Doctor, 15yr old cricketer, Rajasthan NFT art) provided in the previous context. Step 2: Inject a new UI component into index.html called #story-reader-overlay. - It should be a full-screen, slide-up modal (starting at transform: translateY(100%)). - Use the existing design system: background: var(--deep);, z-index: 300, and include a glassmorphic sticky header with a "Close" (✕) button. - The inner content should have specific typography classes for: story-title (Playfair Display), story-meta (Author + Read Time in muted text), story-body (DM Sans, line-height 1.8), and a story-tags flex container for the hashtags. Step 3: Update the REDIRECT_MAP and handleRedirect(key) function in the frontend. - Remove the hardcoded StudyOS URLs for the story cards. - When handleRedirect(key) is called, search the MOCK_STORIES array for an object where story_id === key. - If found, dynamically inject the title, author, read_time, content_body, and tags into the #story-reader-overlay DOM elements. - Trigger the CSS class to slide the modal into view (transform: translateY(0)). Step 4: Add a "swipe-down to close" touch listener or a simple click listener on the close button to dismiss the modal, resetting its transform state and clearing the DOM content to prevent memory leaks. Step 5: Push these changes to the remote branch and open a Pull Request against main.

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