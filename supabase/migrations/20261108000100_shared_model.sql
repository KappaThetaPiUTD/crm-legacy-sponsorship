-- Mith's shared data model. Run ONCE after Rishith's initial schema.
-- This migration owns tables, relationships, constraints and data timestamps.
-- Auth, membership policies, production seeding and application queries are
-- separate team responsibilities. Existing profiles and policies are preserved.
begin;
do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Apply Rishith''s profiles/auth schema first; see docs/START_HERE.md';
  end if;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  contact_name text,
  contact_email text,
  contact_phone text,
  tier text not null default 'unknown' check (tier in ('gold','silver','bronze','partner','unknown')),
  notes text default '',
  status text not null default 'prospect' check (status in ('prospect','contacted','in_talks','committed','received','inactive')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.companies add column if not exists website text;
alter table public.companies add column if not exists archived_at timestamptz;
-- NOT VALID preserves older data but enforces nonblank names on new writes.
alter table public.companies add constraint company_name_not_blank check (length(btrim(name)) > 0) not valid;

create type public.pipeline_stage as enum ('prospect','contacted','in_talks','committed','received');
create type public.sponsor_tier as enum ('unknown','bronze','silver','gold','partner');

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  title text,
  email text,
  phone text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) > 0),
  starts_on date not null,
  ends_on date not null,
  fundraising_goal numeric(12,2) not null default 0
    check (fundraising_goal >= 0 and fundraising_goal < 10000000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.sponsorship_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  semester_id uuid not null references public.semesters(id) on delete restrict,
  owner_id uuid references public.profiles(id) on delete set null,
  stage public.pipeline_stage not null default 'prospect',
  amount numeric(12,2) not null default 0 check (amount >= 0 and amount < 10000000000),
  tier public.sponsor_tier not null default 'unknown',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  assignee_id uuid references public.profiles(id) on delete set null,
  task text not null check (length(btrim(task)) > 0),
  due_on date not null,
  done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((done and completed_at is not null) or (not done and completed_at is null))
);

create index contacts_company_idx on public.contacts(company_id);
create index requests_company_semester_idx on public.sponsorship_requests(company_id, semester_id);
create index requests_semester_stage_idx on public.sponsorship_requests(semester_id, stage);
create index requests_owner_idx on public.sponsorship_requests(owner_id);
create index follow_ups_company_idx on public.follow_ups(company_id);
create index follow_ups_assignee_due_idx on public.follow_ups(assignee_id, due_on) where not done;
create index companies_name_idx on public.companies(lower(name));

-- Preserve a copy of the old single contact. Do not invent amounts or semesters
-- from company-level status/tier; a company can have many requests over time.
insert into public.contacts(company_id, name, email, phone, notes)
select id, coalesce(nullif(btrim(contact_name),''), name || ' contact'),
       contact_email, contact_phone, 'Imported from the original company contact fields.'
from public.companies
where nullif(btrim(contact_name),'') is not null
   or nullif(btrim(contact_email),'') is not null
   or nullif(btrim(contact_phone),'') is not null;

-- Schema-owned timestamps; no login or membership behavior is changed.
create or replace function public.touch_sponsorship_row()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create or replace function public.prepare_sponsorship_follow_up()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not new.done then new.completed_at = null;
  elsif tg_op = 'INSERT' then new.completed_at = now();
  elsif not old.done then new.completed_at = now();
  else new.completed_at = old.completed_at; end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['companies','contacts','semesters','sponsorship_requests','follow_ups'] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I',t,t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.touch_sponsorship_row()',t,t);
  end loop;
end $$;
create trigger follow_up_completion before insert or update on public.follow_ups
for each row execute function public.prepare_sponsorship_follow_up();
revoke all on function public.touch_sponsorship_row(), public.prepare_sponsorship_follow_up() from public, anon, authenticated;

-- New tables are intentionally inaccessible to browser roles until Rishith
-- supplies reviewed member-only grants and policies. No auth policy is supplied
-- here, and the original profiles/companies policies are not changed.
do $$
declare t text;
begin
  foreach t in array array['contacts','semesters','sponsorship_requests','follow_ups'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
  end loop;
end $$;
-- Cover the fresh companies-table path too without changing existing policies.
alter table public.companies enable row level security;
commit;
