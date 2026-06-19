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

alter table public.agencies enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Public demo read agencies" on public.agencies;
drop policy if exists "Public demo insert agencies" on public.agencies;
drop policy if exists "Public demo read leads" on public.leads;
drop policy if exists "Public demo insert leads" on public.leads;

create policy "Public demo read agencies"
on public.agencies for select
using (true);

create policy "Public demo insert agencies"
on public.agencies for insert
with check (true);

create policy "Public demo read leads"
on public.leads for select
using (true);

create policy "Public demo insert leads"
on public.leads for insert
with check (true);

insert into public.agencies (name, owner_name, email, phone)
select 'Demo Medicare Agency', 'Melissa Diaz', 'demo@mdaisolutions.com', '4070000000'
where not exists (
  select 1 from public.agencies where name = 'Demo Medicare Agency'
);
