create table if not exists public.kenya_banks (
  id uuid primary key default gen_random_uuid(),
  bank_code text not null unique,
  name text not null,
  swift_code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.kenya_bank_branches (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.kenya_banks(id) on delete cascade,
  branch_code text not null,
  name text not null,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (bank_id, branch_code)
);

create table if not exists public.mpesa_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  purpose text not null check (purpose in ('ticket', 'sponsorship', 'vendor_booking', 'food_order', 'transport_booking', 'wallet_topup')),
  source_table text,
  source_id uuid,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'KES',
  phone_number text not null,
  account_reference text not null,
  description text not null,
  status public.payment_status not null default 'pending',
  merchant_request_id text,
  checkout_request_id text unique,
  mpesa_receipt_number text,
  result_code integer,
  result_description text,
  callback_payload jsonb not null default '{}'::jsonb,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payout_requests
  add column if not exists requested_processing_deadline timestamptz not null default now() + interval '4 hours';

alter table public.kenya_banks enable row level security;
alter table public.kenya_bank_branches enable row level security;
alter table public.mpesa_transactions enable row level security;

drop policy if exists "kenya_banks_read" on public.kenya_banks;
create policy "kenya_banks_read" on public.kenya_banks
for select to anon, authenticated
using (is_active);

drop policy if exists "kenya_bank_branches_read" on public.kenya_bank_branches;
create policy "kenya_bank_branches_read" on public.kenya_bank_branches
for select to anon, authenticated
using (
  is_active
  and exists (
    select 1 from public.kenya_banks b
    where b.id = bank_id and b.is_active
  )
);

drop policy if exists "mpesa_transactions_read_owner_or_admin" on public.mpesa_transactions;
create policy "mpesa_transactions_read_owner_or_admin" on public.mpesa_transactions
for select to authenticated
using (
  profile_id = (select auth.uid())
  or public.is_super_admin()
);

drop policy if exists "mpesa_transactions_insert_owner" on public.mpesa_transactions;
create policy "mpesa_transactions_insert_owner" on public.mpesa_transactions
for insert to authenticated
with check (profile_id = (select auth.uid()));

drop policy if exists "mpesa_transactions_admin_update" on public.mpesa_transactions;
create policy "mpesa_transactions_admin_update" on public.mpesa_transactions
for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create index if not exists kenya_bank_branches_bank_name_idx on public.kenya_bank_branches(bank_id, name);
create index if not exists mpesa_transactions_profile_status_idx on public.mpesa_transactions(profile_id, status);
create index if not exists mpesa_transactions_checkout_idx on public.mpesa_transactions(checkout_request_id);

insert into public.kenya_banks (bank_code, name, swift_code) values
  ('01', 'KCB Bank Kenya', 'KCBLKENX'),
  ('02', 'Standard Chartered Bank Kenya', 'SCBLKENX'),
  ('03', 'Absa Bank Kenya', 'BARCKENX'),
  ('07', 'NCBA Bank Kenya', 'CBAFKENX'),
  ('11', 'Co-operative Bank of Kenya', 'KCOOKENA'),
  ('16', 'Citibank Kenya', 'CITIKENA'),
  ('18', 'Middle East Bank Kenya', null),
  ('19', 'Bank of Africa Kenya', 'AFRIKENX'),
  ('23', 'Consolidated Bank of Kenya', null),
  ('31', 'Stanbic Bank Kenya', 'SBICKENX'),
  ('35', 'African Banking Corporation Kenya', null),
  ('43', 'EcoBank Kenya', 'ECOCKENA'),
  ('49', 'Spire Bank', null),
  ('50', 'Paramount Bank', null),
  ('51', 'Kingdom Bank', null),
  ('53', 'Guaranty Trust Bank Kenya', 'GTBIKENX'),
  ('54', 'Victoria Commercial Bank', null),
  ('55', 'Guardian Bank', null),
  ('57', 'I&M Bank Kenya', 'IMBLKENA'),
  ('63', 'Diamond Trust Bank Kenya', 'DTKEKENA'),
  ('66', 'Sidian Bank', null),
  ('68', 'Equity Bank Kenya', 'EQBLKENA'),
  ('70', 'Family Bank', 'FABLKENA'),
  ('72', 'Gulf African Bank', null),
  ('74', 'First Community Bank', null),
  ('76', 'UBA Kenya Bank', 'UNAFKENA'),
  ('78', 'Kenya Women Microfinance Bank', null),
  ('79', 'Faulu Microfinance Bank', null),
  ('80', 'Caritas Microfinance Bank', null),
  ('81', 'SMEP Microfinance Bank', null),
  ('86', 'Choice Microfinance Bank', null),
  ('87', 'Sumac Microfinance Bank', null),
  ('89', 'Uwezo Microfinance Bank', null),
  ('90', 'Century Microfinance Bank', null),
  ('93', 'Key Microfinance Bank', null),
  ('97', 'M-Oriental Bank', null),
  ('99', 'Mayfair CIB Bank', null)
on conflict (bank_code) do update set
  name = excluded.name,
  swift_code = excluded.swift_code,
  is_active = true;

with branch_seed(bank_code, branch_code, name, city) as (
  values
    ('01', '000', 'KCB Head Office', 'Nairobi'),
    ('01', '001', 'KCB Moi Avenue', 'Nairobi'),
    ('01', '002', 'KCB Kencom', 'Nairobi'),
    ('01', '003', 'KCB Mombasa', 'Mombasa'),
    ('01', '004', 'KCB Kisumu', 'Kisumu'),
    ('01', '005', 'KCB Eldoret', 'Eldoret'),
    ('68', '000', 'Equity Head Office', 'Nairobi'),
    ('68', '001', 'Equity Supreme Centre', 'Nairobi'),
    ('68', '002', 'Equity Westlands', 'Nairobi'),
    ('68', '003', 'Equity Mombasa', 'Mombasa'),
    ('68', '004', 'Equity Kisumu', 'Kisumu'),
    ('68', '005', 'Equity Eldoret', 'Eldoret'),
    ('11', '000', 'Co-operative Bank Head Office', 'Nairobi'),
    ('11', '001', 'Co-operative Bank Aga Khan Walk', 'Nairobi'),
    ('11', '002', 'Co-operative Bank Westlands', 'Nairobi'),
    ('11', '003', 'Co-operative Bank Mombasa', 'Mombasa'),
    ('11', '004', 'Co-operative Bank Kisumu', 'Kisumu'),
    ('11', '005', 'Co-operative Bank Eldoret', 'Eldoret'),
    ('03', '000', 'Absa Head Office', 'Nairobi'),
    ('03', '001', 'Absa Queensway', 'Nairobi'),
    ('03', '002', 'Absa Westlands', 'Nairobi'),
    ('03', '003', 'Absa Mombasa', 'Mombasa'),
    ('03', '004', 'Absa Kisumu', 'Kisumu'),
    ('03', '005', 'Absa Eldoret', 'Eldoret'),
    ('07', '000', 'NCBA Head Office', 'Nairobi'),
    ('07', '001', 'NCBA Upper Hill', 'Nairobi'),
    ('07', '002', 'NCBA Westlands', 'Nairobi'),
    ('57', '000', 'I&M Bank Head Office', 'Nairobi'),
    ('57', '001', 'I&M Bank Kenyatta Avenue', 'Nairobi'),
    ('57', '002', 'I&M Bank Sarit Centre', 'Nairobi'),
    ('63', '000', 'Diamond Trust Bank Head Office', 'Nairobi'),
    ('63', '001', 'Diamond Trust Bank Nation Centre', 'Nairobi'),
    ('63', '002', 'Diamond Trust Bank Mombasa', 'Mombasa'),
    ('70', '000', 'Family Bank Head Office', 'Nairobi'),
    ('70', '001', 'Family Bank Kenyatta Avenue', 'Nairobi'),
    ('70', '002', 'Family Bank Mombasa', 'Mombasa'),
    ('31', '000', 'Stanbic Bank Head Office', 'Nairobi'),
    ('31', '001', 'Stanbic Bank Kenyatta Avenue', 'Nairobi'),
    ('31', '002', 'Stanbic Bank Chiromo', 'Nairobi'),
    ('02', '000', 'Standard Chartered Head Office', 'Nairobi'),
    ('02', '001', 'Standard Chartered Kenyatta Avenue', 'Nairobi'),
    ('02', '002', 'Standard Chartered Westlands', 'Nairobi')
)
insert into public.kenya_bank_branches (bank_id, branch_code, name, city)
select b.id, s.branch_code, s.name, s.city
from branch_seed s
join public.kenya_banks b on b.bank_code = s.bank_code
on conflict (bank_id, branch_code) do update set
  name = excluded.name,
  city = excluded.city,
  is_active = true;
