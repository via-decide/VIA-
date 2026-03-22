# VIA Sovereign Platform Integration Package

This package adds a preservation-first integration blueprint for merging the standalone Mars and Orchade modules into the authenticated VIA host without modifying the live Google/Firebase login flow.

## Files

| File | Purpose |
|------|---------|
| `dashboard.index.html` | Dark-mode sovereign launcher that shows Google identity context, exposes Mars and Orchade cards, and loads the selected module in an isolated iframe after requesting a short-lived VIA session envelope. |
| `nginx.via.conf` | Reverse-proxy example for `/mars`, `/orchade`, `/api/auth/session-token`, and `/api/telemetry/sync`. |
| `node-sso-example.mjs` | Example Node/Express auth bridge that verifies the active VIA session, mints an encrypted JWE, and validates that token inside Mars or Orchade. |
| `telemetry-schema.sql` | Cohort schema update for Orchade MBB telemetry persistence and longitudinal lookup. |

## Integration Notes

1. Keep the current VIA login shell as the only public sign-in surface.
2. Hydrate `window.__VIA_SESSION__` after the Google/Firebase session resolves so the dashboard can render the operator name and avatar immediately.
3. Serve the dashboard from the VIA host and reverse-proxy Mars and Orchade behind the same top-level domain for shared transport policy and CSP enforcement.
4. Issue short-lived encrypted JWE envelopes only at module launch time; do not persist them in local storage.
5. Route Orchade telemetry into the Cohort persistence layer strictly through `/api/telemetry/sync` or the `upsert_orchade_mbb_telemetry` SQL function.

## Validation Steps

1. Open `dashboard.index.html` behind an authenticated VIA session and confirm the name/avatar hydrate from `window.__VIA_SESSION__`.
2. Click `MARS SIMULATOR` and verify the browser requests `POST /api/auth/session-token` with `{ "target": "mars" }`.
3. Click `ORCHADE SOCIAL HUB` and verify the iframe receives `/orchade/?sso=<token>`.
4. Submit a sample Orchade payload to `/api/telemetry/sync` and confirm the row appears in `cohort_user_bio_telemetry_latest`.
