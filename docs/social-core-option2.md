# Social Core Option 2

This package starts Option 2 for VIA's browser-first social backend.

## Included primitives

- `shared/social-core.js`
  - bootstraps and normalizes user profiles
  - keeps local social state for posts, follows, reactions, circles, memberships, and moderation flags
  - syncs derived profile counts (`followers`, `following`, `posts`) back into the active VIA user record
  - attempts optional Supabase writes for `via_posts`, `via_follows`, `via_reactions`, `via_circles`, `via_circle_members`, and `via_moderation_queue`
- `auth.html`
  - documents the starter SQL schema and RLS policies for the social tables
  - bootstraps social state during sign-in and sign-up
- `index.html`
  - uses shared Supabase config instead of hardcoded placeholders
  - hydrates the profile view from `SocialCore` so counts stay consistent with local social state

## Local state key

- `viadecide.social.core`

## Next safe step

Add a lightweight composer and feed renderer that writes through `SocialCore.createPost(...)` so the visible feed can start using the same local/remote social schema.
