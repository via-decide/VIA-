Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
We need to transform the single-player swipe deck into a synchronous, multiplayer experience by implementing a "Realtime Reaction Mesh." When any user interacts with a story, others should see it happen live. Step 1: Create src/core/ux/ReactionEngine.js. Initialize a Supabase Realtime channel named mesh:feed_reactions. Step 2: Update the likeCard(index) function and the zone_Affirmation gestural trigger. When fired, broadcast a lightweight payload to the channel: { user_id: 'id', action: 'like', emoji: '🔥', story_id: 'xyz' }. Step 3: Implement the MeshListener. When a broadcast is received for the *currently active card*, dynamically spawn a DOM element (div.mesh-reaction) at a randomized X-coordinate near the bottom of the screen. Step 4: Write high-performance CSS @keyframes in your stylesheet to animate this element. It should float upwards (translateY(-60vh)), sway slightly horizontally (using Math.sin or CSS keyframe steps), scale up, and fade out over 2.5 seconds. Step 5: Add a "Quick React" mini-bar (hidden by default, appears on tap) above the bottom nav with 👏, 💯, 🚀, ❤️. Tapping these broadcasts the specific emoji to the mesh.

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