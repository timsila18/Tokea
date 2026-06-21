create table public.event_feature_settings (
  event_id uuid primary key references public.events(id) on delete cascade,
  foodo_active boolean not null default false,
  triplink_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  email text not null,
  role_title text not null,
  department public.workforce_category,
  invite_token uuid not null default gen_random_uuid(),
  status public.application_status not null default 'submitted',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create table public.volunteer_opportunities (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  required_count integer not null default 1 check (required_count > 0),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  channel text not null,
  message text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.vendor_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  service_category text not null,
  requirements text not null,
  budget_cents integer check (budget_cents is null or budget_cents >= 0),
  status text not null default 'open' check (status in ('open', 'reviewing', 'quoted', 'booked', 'closed')),
  requested_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sponsorship_packages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  benefits text[] not null default '{}',
  inventory_count integer not null default 1 check (inventory_count > 0),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.event_feature_settings enable row level security;
alter table public.staff_invitations enable row level security;
alter table public.volunteer_opportunities enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.vendor_requests enable row level security;
alter table public.sponsorship_packages enable row level security;

grant select, insert, update, delete on public.event_feature_settings, public.staff_invitations, public.volunteer_opportunities, public.marketing_campaigns, public.vendor_requests, public.sponsorship_packages to authenticated;

create policy "feature_settings_event_manager" on public.event_feature_settings
for all to authenticated using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));
create policy "staff_invitations_event_manager" on public.staff_invitations
for all to authenticated using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));
create policy "volunteer_opportunities_event_manager" on public.volunteer_opportunities
for all to authenticated using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));
create policy "marketing_campaigns_event_manager" on public.marketing_campaigns
for all to authenticated using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));
create policy "vendor_requests_event_manager" on public.vendor_requests
for all to authenticated using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));
create policy "sponsorship_packages_event_manager" on public.sponsorship_packages
for all to authenticated using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));

alter publication supabase_realtime add table public.event_feature_settings;
alter publication supabase_realtime add table public.staff_invitations;
alter publication supabase_realtime add table public.volunteer_opportunities;
alter publication supabase_realtime add table public.marketing_campaigns;
alter publication supabase_realtime add table public.vendor_requests;
alter publication supabase_realtime add table public.sponsorship_packages;
