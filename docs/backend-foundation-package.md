# Backend Foundation Package

This package starts Option 1 of the VIA backend foundation without adding a build step.

## What it adds

- `window.DatabaseService` is now bootstrapped by `shared/tool-storage.js`.
- Tool writes performed through `window.ToolStorage.write(...)` are mirrored into a local backend activity journal.
- Agent runs performed through `window.AgentRuntime` are mirrored into the same activity journal.
- If Supabase is configured and the `via_activity_log` table exists, pending activity records are flushed to Supabase automatically.
- `DatabaseService.getUserProfile(userId)` now resolves a local or Supabase-backed VIA profile and synthesizes `identityMd` for prompt injection.

## Supabase config inputs

The foundation reads configuration from these browser values:

1. `window.ECO_SUPABASE_URL` (optional, defaults to the VIA project URL)
2. `window.ECO_SUPABASE_ANON_KEY`
3. `window.SUPABASE_ANON_KEY`
4. `localStorage['eco_supabase_url']`
5. `localStorage['eco_supabase_anon_key']`

## Suggested SQL bootstrap

```sql
CREATE TABLE via_activity_log (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  page_path TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE via_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert activity logs"
ON via_activity_log
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read activity logs"
ON via_activity_log
FOR SELECT
TO authenticated
USING (true);
```

## Local journal keys

- `viadecide.backend.activity`
- `viadecide.backend.activity.pending`

## Next recommended step

After this foundation lands, the next safe increment is to add a schema validator for activity payloads before widening the set of tools that sync remotely.
