# VIA Sovereign Platform Integration Package

This package adds a preservation-first integration blueprint for merging the standalone Mars and Orchade modules into the authenticated VIA host without modifying the live Google/Firebase login flow.

## Files

| File | Purpose |
|------|---------|
| `dashboard.index.html` | Dark-mode sovereign launcher that shows Google identity context, exposes Mars and Orchade cards, and loads the selected module in an isolated iframe after requesting a short-lived VIA session envelope. |
| `nginx.via.conf` | Reverse-proxy example for `/mars`, `/orchade`, `/api/auth/session-token`, and `/api/telemetry/sync`. |
| `node-sso-example.mjs` | Example Node/Express auth bridge that verifies the active VIA session, mints an encrypted JWE, and validates that token inside Mars or Orchade. |
| `telemetry-schema.sql` | Cohort schema update for Orchade MBB telemetry persistence and longitudinal lookup. |
| `upgrades-status.schema.json` | JSON schema for the `GET /api/upgrades/status` telemetry packet used by the main VIA dashboard upgrades panel. |

## Integration Notes

1. Keep the current VIA login shell as the only public sign-in surface.
2. Hydrate `window.__VIA_SESSION__` after the Google/Firebase session resolves so the dashboard can render the operator name and avatar immediately.
3. Serve the dashboard from the VIA host and reverse-proxy Mars and Orchade behind the same top-level domain for shared transport policy and CSP enforcement.
4. Issue short-lived encrypted JWE envelopes only at module launch time; do not persist them in local storage.
5. Route Orchade telemetry into the Cohort persistence layer strictly through `/api/telemetry/sync` or the `upsert_orchade_mbb_telemetry` SQL function.
6. Serve upgrades telemetry from `GET /api/upgrades/status` with a 30-second cache window and read-only GitHub credentials.

## Validation Steps

1. Open `dashboard.index.html` behind an authenticated VIA session and confirm the name/avatar hydrate from `window.__VIA_SESSION__`.
2. Click `MARS SIMULATOR` and verify the browser requests `POST /api/auth/session-token` with `{ "target": "mars" }`.
3. Click `ORCHADE SOCIAL HUB` and verify the iframe receives `/orchade/?sso=<token>`.
4. Submit a sample Orchade payload to `/api/telemetry/sync` and confirm the row appears in `cohort_user_bio_telemetry_latest`.
5. Load the main `index.html` dashboard and verify the Upgrades & Roadmap panel hydrates from `GET /api/upgrades/status`.

## Upgrades Telemetry Endpoint

`GET /api/upgrades/status` returns a single packet for the dashboard summary bar, the Mars and Orchade roadmap tracks, and the last five commits across the configured repository mesh.

### Environment

- `VIA_GITHUB_TOKEN` or `GITHUB_TOKEN`: GitHub token with read-only access to repository metadata and GraphQL history.
- `VIA_UPGRADES_REPOS`: JSON array or comma-separated list of repositories to aggregate, for example `["via-decide/VIA","via-decide/mars","via-decide/orchade"]`.
- `VIA_UPGRADES_MARS_REPO`: Optional explicit repository override for the Mars track.
- `VIA_UPGRADES_ORCHADE_REPO`: Optional explicit repository override for the Orchade track.

### Runtime characteristics

- The server caches telemetry for 30 seconds to keep the route read-only and low-overhead.
- If GitHub credentials are unavailable, the endpoint returns a clearly marked fallback snapshot so the dashboard stays stable without interrupting auth or gameplay.
- The response contract is defined in `upgrades-status.schema.json`.
