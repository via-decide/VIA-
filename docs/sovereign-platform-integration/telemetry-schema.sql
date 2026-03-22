-- VIA Cohort telemetry extension for Orchade MBB synchronization.
-- PostgreSQL / Supabase-style SQL.

create extension if not exists pgcrypto;

create table if not exists cohort_user_bio_telemetry (
  id uuid primary key default gen_random_uuid(),
  google_uid text not null,
  google_email text,
  module_name text not null default 'orchade',
  session_id uuid not null,
  device_id text,
  recorded_at timestamptz not null default now(),
  ingested_at timestamptz not null default now(),
  mind_score numeric(5,2) not null check (mind_score between 0 and 100),
  body_score numeric(5,2) not null check (body_score between 0 and 100),
  breath_score numeric(5,2) not null check (breath_score between 0 and 100),
  stress_index numeric(5,2) not null default 0 check (stress_index between 0 and 100),
  recovery_index numeric(5,2) not null default 0 check (recovery_index between 0 and 100),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cohort_user_bio_telemetry_uid_recorded_idx
  on cohort_user_bio_telemetry (google_uid, recorded_at desc);

create index if not exists cohort_user_bio_telemetry_session_idx
  on cohort_user_bio_telemetry (session_id);

create unique index if not exists cohort_user_bio_telemetry_session_recorded_uniq
  on cohort_user_bio_telemetry (google_uid, session_id, recorded_at);

create or replace function set_cohort_user_bio_telemetry_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_cohort_user_bio_telemetry_updated_at on cohort_user_bio_telemetry;
create trigger trg_set_cohort_user_bio_telemetry_updated_at
before update on cohort_user_bio_telemetry
for each row
execute function set_cohort_user_bio_telemetry_updated_at();

create or replace function upsert_orchade_mbb_telemetry(
  p_google_uid text,
  p_google_email text,
  p_session_id uuid,
  p_device_id text,
  p_recorded_at timestamptz,
  p_mind_score numeric,
  p_body_score numeric,
  p_breath_score numeric,
  p_stress_index numeric,
  p_recovery_index numeric,
  p_source_payload jsonb
)
returns cohort_user_bio_telemetry
language plpgsql
security definer
as $$
declare
  v_row cohort_user_bio_telemetry;
begin
  insert into cohort_user_bio_telemetry (
    google_uid,
    google_email,
    session_id,
    device_id,
    recorded_at,
    mind_score,
    body_score,
    breath_score,
    stress_index,
    recovery_index,
    source_payload
  )
  values (
    p_google_uid,
    p_google_email,
    p_session_id,
    p_device_id,
    coalesce(p_recorded_at, now()),
    p_mind_score,
    p_body_score,
    p_breath_score,
    coalesce(p_stress_index, 0),
    coalesce(p_recovery_index, 0),
    coalesce(p_source_payload, '{}'::jsonb)
  )
  on conflict (google_uid, session_id, recorded_at)
  do update set
    google_email = excluded.google_email,
    device_id = excluded.device_id,
    mind_score = excluded.mind_score,
    body_score = excluded.body_score,
    breath_score = excluded.breath_score,
    stress_index = excluded.stress_index,
    recovery_index = excluded.recovery_index,
    source_payload = excluded.source_payload,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace view cohort_user_bio_telemetry_latest as
select distinct on (google_uid)
  google_uid,
  google_email,
  module_name,
  session_id,
  device_id,
  recorded_at,
  mind_score,
  body_score,
  breath_score,
  stress_index,
  recovery_index,
  source_payload,
  created_at,
  updated_at
from cohort_user_bio_telemetry
order by google_uid, recorded_at desc;
