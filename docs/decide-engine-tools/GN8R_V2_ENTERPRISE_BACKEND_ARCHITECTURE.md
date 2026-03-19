# GN8R V2: Enterprise Backend Architecture 🌩️

## Phase 6 Overview
GN8R is migrating from client-side state and mock backend services to a distributed cloud architecture designed for Telegram-scale throughput.

### Platform goals
- Replace local-first mock persistence with cloud-backed relational state.
- Absorb burst traffic without exhausting database connections.
- Support native Telegram monetization flows.
- Enable live multiplayer synchronization without polling.

## The 4-Layer Cloud Stack

### 1) Relational State — Supabase (PostgreSQL)
Supabase PostgreSQL becomes the single source of truth for:
- Wallet balances
- Plant progression
- Agent plan JSON
- Affiliate trees
- Workflow execution records

#### Key requirements
- Strict Row Level Security (RLS) on all user-owned data.
- Webhooks and async workers should perform read/write through secure server routes.
- Schema should remain snake_case for consistency with existing conventions.

### 2) Redis Buffer — Upstash Redis
Upstash Redis is introduced as an edge-optimized buffer to prevent Postgres pool exhaustion during spikes.

#### Core responsibilities
- Cache hot user state (for example, wallet snapshots and session metadata).
- Enforce request throttling (for example, 10 requests / 10 seconds / user).
- Reduce duplicate expensive operations during repeated Telegram interactions.

### 3) Telegram Stars Economy
GN8R monetization uses native Telegram Stars invoicing.

#### Backend flow
1. Generate invoices for Lumina packs.
2. Handle `pre_checkout_query` validation.
3. Handle `successful_payment` confirmation.
4. Credit Supabase wallet atomically and idempotently.

### 4) Supabase Realtime — Multiplayer Sync
Layer 2 “The Commons” uses realtime channels for Circle (Clan) cooperative gameplay.

#### Gameplay sync examples
- Live boss damage contribution updates.
- XP deltas per teammate in near real time.
- Leaderboard movement without client polling loops.

## Suggested execution order
1. Migrate core user entities to Supabase with RLS policies.
2. Add Upstash caching and rate-limit middleware at webhook ingress.
3. Integrate Telegram Stars payment lifecycle + wallet crediting safeguards.
4. Wire Supabase Realtime channels for Circle combat + leaderboard events.

## Non-goals for this phase
- No rollback to localStorage/MockDatabase as primary persistence.
- No polling-based multiplayer refresh where realtime channels are available.
