Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-global-identity-manager to handle unified user authentication and cross-platform profile mapping. 1. Create a new directory src/core/auth/identity-manager/. 2. Create auth-config.json defining supported authentication methods (JWT, OAuth2, API Keys), token expiration times, and secure hashing salts. 3. Implement IdentityStore.js (or .ts). This module must manage a mapping table that links various platform-specific IDs (e.g., a WhatsApp phone number, a Telegram ID, or a Web UUID) to a single, unified "VIA Global ID." 4. Build a secure session manager that issues and validates JSON Web Tokens (JWT). This must be integrated as a high-priority middleware in the SocketMesh and PredictiveEngine to ensure every agent interaction is tied to a verified identity. 5. Implement "Agent-Level Permissions": Define a schema where specific agents or tools can only access certain user data "scopes" (e.g., the "NewsAgent" can see interests but not private messages). 6. Add a "Profile Hydrator" function that fetches and caches the unified user profile into the EdgeStore upon the first request of a session to minimize database lookups.

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