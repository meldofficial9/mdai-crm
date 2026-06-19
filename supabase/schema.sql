-- MDAI CRM v1.0 Database Setup
-- Run this in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists public.agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_name text,
  email text,
  phone text,
  status text default 'active',
  plan text default 'starter',
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references public.agencies(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  email text,
  state text,
  zip_code text,
  product text default 'Medicare',
  status text default 'New Lead',
  lead_source text,
  interest_level text default 'Unknown',
  ai_summary text,
  created_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade,
  sender text not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade,
  appointment_time timestamptz,
  agent_name text,
  status text default 'Scheduled',
  created_at timestamptz default now()
);

-- Allow public anon reads/inserts for MVP demo only.
-- Later, we will replace this with secure login and row-level security.
alter table public.agencies enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "MVP public agencies read" on public.agencies;
drop policy if exists "MVP public agencies insert" on public.agencies;
drop policy if exists "MVP public leads read" on public.leads;
drop policy if exists "MVP public leads insert" on public.leads;

create policy "MVP public agencies read"
on public.agencies for select
to anon
using (true);

create policy "MVP public agencies insert"
on public.agencies for insert
to anon
with check (true);

create policy "MVP public leads read"
on public.leads for select
to anon
using (true);

create policy "MVP public leads insert"
on public.leads for insert
to anon
with check (true);

-- Demo agency + demo lead
insert into public.agencies (name, owner_name, email, phone)
select 'Demo Medicare Agency', 'Melissa Diaz', 'demo@mdaisolutions.com', '4070000000'
where not exists (select 1 from public.agencies where name = 'Demo Medicare Agency');

insert into public.leads (
  agency_id,
  first_name,
  last_name,
  phone,
  email,
  state,
  zip_code,
  product,
  status,
  lead_source,
  interest_level,
  ai_summary
)
select
  id,
  'John',
  'Smith',
  '555-123-4567',
  'john@example.com',
  'FL',
  '33101',
  'Medicare',
  'New Lead',
  'Facebook',
  'High',
  'Interested in Medicare options and prefers text follow-up.'
from public.agencies
where name = 'Demo Medicare Agency'
and not exists (select 1 from public.leads where email = 'john@example.com');
