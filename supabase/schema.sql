create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'officer', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  contact_name text,
  contact_email text,
  contact_phone text,
  tier text not null default 'unknown' check (tier in ('gold', 'silver', 'bronze', 'partner', 'unknown')),
  notes text default '',
  status text not null default 'prospect' check (
    status in ('prospect', 'contacted', 'in_talks', 'committed', 'received', 'inactive')
  ),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.update_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute procedure public.update_updated_at();

create or replace function public.user_has_role(role_name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = role_name
  );
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Admins can manage all profiles"
on public.profiles
for all
using (public.user_has_role('admin'))
with check (public.user_has_role('admin'));

create policy "Members can view companies"
on public.companies
for select
using (auth.uid() is not null);

create policy "Officers and admins can insert companies"
on public.companies
for insert
with check (
  auth.uid() is not null
  and (public.user_has_role('officer') or public.user_has_role('admin'))
);

create policy "Officers and admins can update companies"
on public.companies
for update
using (
  public.user_has_role('officer') or public.user_has_role('admin')
)
with check (
  public.user_has_role('officer') or public.user_has_role('admin')
);

create policy "Admins can delete companies"
on public.companies
for delete
using (public.user_has_role('admin'));
