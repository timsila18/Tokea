create extension if not exists pgcrypto;

create type public.app_role as enum (
  'super_admin',
  'organizer',
  'attendee',
  'vendor',
  'event_staff'
);

create type public.event_status as enum (
  'draft',
  'published',
  'cancelled',
  'completed'
);

create type public.media_type as enum (
  'poster',
  'image',
  'video'
);

create type public.event_visibility as enum (
  'public',
  'private',
  'invite_only'
);

create type public.interest_status as enum (
  'interested',
  'going',
  'not_going'
);

create type public.community_channel_kind as enum (
  'general',
  'announcements',
  'questions',
  'photos',
  'networking',
  'transport',
  'food',
  'support'
);

create type public.follow_target_type as enum (
  'organizer',
  'venue',
  'artist',
  'speaker',
  'brand',
  'event_series'
);

create type public.moderation_status as enum (
  'active',
  'pending_review',
  'hidden',
  'removed'
);

create type public.ticket_visibility as enum (
  'public',
  'private',
  'hidden'
);

create type public.ticket_order_status as enum (
  'draft',
  'pending_payment',
  'paid',
  'failed',
  'cancelled',
  'refunded',
  'expired'
);

create type public.payment_status as enum (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded'
);

create type public.payment_method as enum (
  'mpesa_stk',
  'mpesa_paybill',
  'mpesa_till',
  'card_future'
);

create type public.ticket_status as enum (
  'active',
  'used',
  'transferred',
  'cancelled',
  'refunded',
  'expired'
);

create type public.discount_type as enum (
  'percentage',
  'fixed',
  'free_ticket'
);

create type public.commission_type as enum (
  'percentage',
  'fixed'
);

create type public.refund_policy as enum (
  'no_refunds',
  'until_x_days',
  'approval_required',
  'automatic'
);

create type public.refund_status as enum (
  'requested',
  'approved',
  'rejected',
  'processing',
  'completed',
  'cancelled'
);

create type public.transfer_status as enum (
  'pending',
  'accepted',
  'cancelled',
  'expired'
);

create type public.waitlist_status as enum (
  'waiting',
  'notified',
  'converted',
  'cancelled'
);

create type public.payout_status as enum (
  'requested',
  'processing',
  'completed',
  'rejected',
  'frozen'
);

create type public.verification_status as enum (
  'not_submitted',
  'pending',
  'approved',
  'rejected',
  'needs_more_info'
);

create type public.checkin_source as enum (
  'online_scanner',
  'offline_scanner',
  'manual_search'
);

create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.task_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'done',
  'cancelled'
);

create type public.sponsorship_status as enum (
  'draft',
  'submitted',
  'negotiating',
  'approved',
  'rejected',
  'paid',
  'completed'
);

create type public.vendor_booking_status as enum (
  'requested',
  'quoted',
  'accepted',
  'declined',
  'booked',
  'completed',
  'cancelled'
);

create type public.organizer_team_role as enum (
  'owner',
  'admin',
  'finance_manager',
  'marketing_manager',
  'operations_manager',
  'ticketing_manager',
  'support_agent',
  'custom'
);

create type public.document_type as enum (
  'contract',
  'permit',
  'venue_agreement',
  'sponsor_agreement',
  'vendor_agreement',
  'insurance',
  'invoice',
  'receipt',
  'other'
);

create type public.ai_content_type as enum (
  'event_plan',
  'marketing_caption',
  'facebook_post',
  'instagram_caption',
  'tiktok_caption',
  'whatsapp_promo',
  'email_campaign',
  'press_release',
  'poster_text',
  'pricing_recommendation'
);

create type public.workspace_channel_kind as enum (
  'general',
  'announcements',
  'operations',
  'ticketing',
  'security',
  'vip',
  'sponsors',
  'vendors',
  'food_vendors',
  'transport',
  'media',
  'emergency',
  'lost_found',
  'support',
  'staff',
  'volunteers'
);

create type public.message_kind as enum (
  'text',
  'file',
  'photo',
  'video',
  'voice_note',
  'system'
);

create type public.meeting_status as enum (
  'scheduled',
  'live',
  'ended',
  'cancelled'
);

create type public.workforce_category as enum (
  'security',
  'ushers',
  'ticket_scanners',
  'parking_staff',
  'cleaners',
  'media_team',
  'photographers',
  'videographers',
  'mc_team',
  'vip_coordinators',
  'customer_support',
  'backstage_staff',
  'operations_team'
);

create type public.application_status as enum (
  'submitted',
  'reviewing',
  'interview_scheduled',
  'approved',
  'rejected',
  'assigned'
);

create type public.shift_status as enum (
  'scheduled',
  'checked_in',
  'checked_out',
  'missed',
  'approved'
);

create type public.incident_severity as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.incident_status as enum (
  'open',
  'assigned',
  'resolved',
  'closed'
);

create type public.approval_status as enum (
  'pending',
  'approved',
  'rejected',
  'changes_requested'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone_number text not null unique,
  role public.app_role not null default 'attendee',
  disabled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone_number text not null unique,
  role public.app_role not null default 'attendee',
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.organizer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  organization_name text not null,
  description text,
  banner_url text,
  logo_url text,
  website_url text,
  social_links jsonb not null default '{}'::jsonb,
  follower_count integer not null default 0,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.venue_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  capacity integer check (capacity is null or capacity >= 0),
  location_name text not null,
  city text default 'Nairobi',
  map_url text,
  image_urls text[] not null default '{}',
  rating_average numeric(3,2) not null default 0,
  review_count integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  category text,
  pricing_summary text,
  rating_average numeric(3,2) not null default 0,
  review_count integer not null default 0,
  completed_jobs integer not null default 0,
  response_time_minutes integer,
  acceptance_rate numeric(5,2) not null default 0,
  portfolio_urls text[] not null default '{}',
  service_locations text[] not null default '{}',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  assigned_organizer_id uuid references public.organizer_profiles(id) on delete set null,
  staff_category public.workforce_category,
  skills text[] not null default '{}',
  experience_summary text,
  rating_average numeric(3,2) not null default 0,
  past_event_count integer not null default 0,
  availability jsonb not null default '{}'::jsonb,
  document_paths text[] not null default '{}',
  emergency_contact jsonb not null default '{}'::jsonb,
  preferred boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  category_id uuid references public.event_categories(id) on delete set null,
  venue_profile_id uuid references public.venue_profiles(id) on delete set null,
  title text not null,
  description text,
  caption text,
  location_name text not null,
  venue text,
  city text default 'Nairobi',
  starts_at timestamptz not null,
  ends_at timestamptz,
  visibility public.event_visibility not null default 'public',
  share_slug text unique default encode(gen_random_bytes(8), 'hex'),
  ticket_starting_price_cents integer default 0 check (ticket_starting_price_cents is null or ticket_starting_price_cents >= 0),
  capacity_total integer check (capacity_total is null or capacity_total >= 0),
  refund_policy public.refund_policy not null default 'approval_required',
  refund_until_days_before integer check (refund_until_days_before is null or refund_until_days_before >= 0),
  like_count integer not null default 0,
  comment_count integer not null default 0,
  interested_count integer not null default 0,
  going_count integer not null default 0,
  save_count integer not null default 0,
  view_count integer not null default 0,
  trending_score numeric not null default 0,
  status public.event_status not null default 'draft',
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  media_type public.media_type not null,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'KES',
  quantity_total integer not null check (quantity_total >= 0),
  quantity_sold integer not null default 0 check (quantity_sold >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  max_per_user integer not null default 10 check (max_per_user > 0),
  refundable boolean not null default false,
  transferable boolean not null default true,
  visibility public.ticket_visibility not null default 'public',
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status public.ticket_order_status not null default 'pending_payment',
  order_number text not null unique default upper(encode(gen_random_bytes(6), 'hex')),
  promo_code_id uuid,
  affiliate_promoter_id uuid,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  platform_fee_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'KES',
  quantity integer not null default 0 check (quantity >= 0),
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ticket_holders (
  id uuid primary key default gen_random_uuid(),
  ticket_order_id uuid not null references public.ticket_orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_number text not null unique default upper(encode(gen_random_bytes(8), 'hex')),
  holder_name text not null,
  holder_phone text,
  status public.ticket_status not null default 'active',
  seat_label text,
  qr_version integer not null default 1,
  checked_in_at timestamptz,
  transferred_from_ticket_id uuid references public.ticket_holders(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ticket_payments (
  id uuid primary key default gen_random_uuid(),
  ticket_order_id uuid not null references public.ticket_orders(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'mpesa_daraja',
  method public.payment_method not null default 'mpesa_stk',
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'KES',
  phone_number text,
  merchant_request_id text,
  checkout_request_id text,
  mpesa_receipt_number text,
  provider_payload jsonb not null default '{}'::jsonb,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_qr_codes (
  id uuid primary key default gen_random_uuid(),
  ticket_holder_id uuid not null unique references public.ticket_holders(id) on delete cascade,
  qr_nonce_hash text not null unique,
  qr_version integer not null default 1,
  active boolean not null default true,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table public.ticket_wallet (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  ticket_holder_id uuid not null unique references public.ticket_holders(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  status public.ticket_status not null default 'active',
  wallet_section text not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  code text not null,
  discount_type public.discount_type not null,
  discount_value integer not null check (discount_value >= 0),
  max_uses integer,
  usage_count integer not null default 0 check (usage_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  ticket_type_ids uuid[] not null default '{}',
  organizer_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (event_id, code)
);

create table public.promo_code_usage (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  ticket_order_id uuid not null references public.ticket_orders(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  discount_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique (promo_code_id, ticket_order_id)
);

create table public.affiliate_promoters (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  code text not null,
  display_name text not null,
  commission_type public.commission_type not null default 'percentage',
  commission_value integer not null default 0 check (commission_value >= 0),
  tickets_sold integer not null default 0,
  revenue_cents integer not null default 0,
  commission_earned_cents integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (event_id, code)
);

create table public.affiliate_sales (
  id uuid primary key default gen_random_uuid(),
  affiliate_promoter_id uuid not null references public.affiliate_promoters(id) on delete cascade,
  ticket_order_id uuid not null references public.ticket_orders(id) on delete cascade,
  tickets_sold integer not null default 0,
  revenue_cents integer not null default 0,
  commission_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique (affiliate_promoter_id, ticket_order_id)
);

create table public.ticket_transfers (
  id uuid primary key default gen_random_uuid(),
  ticket_holder_id uuid not null references public.ticket_holders(id) on delete cascade,
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  recipient_phone text not null,
  to_profile_id uuid references public.profiles(id) on delete set null,
  status public.transfer_status not null default 'pending',
  old_qr_code_id uuid references public.ticket_qr_codes(id) on delete set null,
  new_ticket_holder_id uuid references public.ticket_holders(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '24 hours',
  created_at timestamptz not null default now()
);

create table public.ticket_refunds (
  id uuid primary key default gen_random_uuid(),
  ticket_order_id uuid not null references public.ticket_orders(id) on delete cascade,
  ticket_holder_id uuid references public.ticket_holders(id) on delete set null,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status public.refund_status not null default 'requested',
  amount_cents integer not null default 0,
  reason text,
  organizer_notes text,
  processed_by uuid references public.profiles(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ticket_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_holder_id uuid not null references public.ticket_holders(id) on delete cascade,
  staff_profile_id uuid references public.profiles(id) on delete set null,
  source public.checkin_source not null default 'online_scanner',
  offline_scan_id text unique,
  device_id text,
  scan_payload_hash text not null,
  result text not null,
  checked_in_at timestamptz not null default now(),
  synced_at timestamptz,
  unique (ticket_holder_id)
);

create table public.event_capacity (
  event_id uuid primary key references public.events(id) on delete cascade,
  capacity_total integer not null check (capacity_total >= 0),
  sold_count integer not null default 0 check (sold_count >= 0),
  reserved_count integer not null default 0 check (reserved_count >= 0),
  waitlist_count integer not null default 0 check (waitlist_count >= 0),
  updated_at timestamptz not null default now()
);

create table public.waitlists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id) on delete set null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.waitlist_status not null default 'waiting',
  notified_at timestamptz,
  converted_order_id uuid references public.ticket_orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, ticket_type_id, profile_id)
);

create table public.organizer_verification (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null unique references public.organizer_profiles(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  status public.verification_status not null default 'pending',
  id_document_path text,
  business_registration_path text,
  kra_pin_path text,
  additional_document_paths text[] not null default '{}',
  admin_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status public.payout_status not null default 'requested',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'KES',
  payout_method text not null default 'mpesa_future',
  destination_details jsonb not null default '{}'::jsonb,
  admin_notes text,
  processed_by uuid references public.profiles(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  due_at timestamptz,
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  notes text,
  attachment_paths text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.event_tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.event_budgets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category text not null,
  budgeted_cents integer not null default 0 check (budgeted_cents >= 0),
  actual_cents integer not null default 0 check (actual_cents >= 0),
  variance_cents integer generated always as (budgeted_cents - actual_cents) stored,
  notes text,
  created_at timestamptz not null default now(),
  unique (event_id, category)
);

create table public.event_expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  budget_id uuid references public.event_budgets(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  category text not null,
  amount_cents integer not null check (amount_cents >= 0),
  description text not null,
  receipt_path text,
  incurred_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.event_finances (
  event_id uuid primary key references public.events(id) on delete cascade,
  revenue_cents integer not null default 0,
  expenses_cents integer not null default 0,
  sponsor_income_cents integer not null default 0,
  vendor_costs_cents integer not null default 0,
  marketing_costs_cents integer not null default 0,
  transport_costs_cents integer not null default 0,
  food_revenue_cents integer not null default 0,
  staff_costs_cents integer not null default 0,
  projected_profit_cents integer not null default 0,
  actual_profit_cents integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  company_name text not null,
  description text,
  logo_url text,
  industries text[] not null default '{}',
  target_audiences text[] not null default '{}',
  budget_min_cents integer,
  budget_max_cents integer,
  locations text[] not null default '{}',
  brand_goals text[] not null default '{}',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.sponsor_applications (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status public.sponsorship_status not null default 'submitted',
  proposal text,
  proposed_amount_cents integer default 0,
  deliverables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sponsor_id, event_id)
);

create table public.sponsorship_contracts (
  id uuid primary key default gen_random_uuid(),
  sponsor_application_id uuid not null references public.sponsor_applications(id) on delete cascade,
  contract_path text,
  brand_asset_paths text[] not null default '{}',
  payment_status public.payment_status not null default 'pending',
  deliverables_status text not null default 'pending',
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.vendor_bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status public.vendor_booking_status not null default 'requested',
  quote_cents integer,
  requirements text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (vendor_id, event_id, reviewer_id)
);

create table public.organizer_teams (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  invited_phone text,
  role public.organizer_team_role not null default 'support_agent',
  status text not null default 'invited',
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organizer_id, profile_id)
);

create table public.organizer_permissions (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.organizer_teams(id) on delete cascade,
  permission_key text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (team_member_id, permission_key)
);

create table public.event_documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  document_type public.document_type not null default 'other',
  title text not null,
  storage_path text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.ai_generated_content (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  organizer_id uuid references public.organizer_profiles(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  content_type public.ai_content_type not null,
  prompt_inputs jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.event_analytics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  metric_date date not null default current_date,
  ticket_sales integer not null default 0,
  sales_velocity numeric not null default 0,
  revenue_cents integer not null default 0,
  attendance_percentage numeric not null default 0,
  checkin_rate numeric not null default 0,
  community_growth integer not null default 0,
  top_promoters jsonb not null default '[]'::jsonb,
  top_sponsors jsonb not null default '[]'::jsonb,
  top_vendors jsonb not null default '[]'::jsonb,
  audience_demographics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (event_id, metric_date)
);

create table public.event_workspaces (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  name text not null,
  operations_room_enabled boolean not null default true,
  communication_hub_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workspace_channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.event_workspaces(id) on delete cascade,
  kind public.workspace_channel_kind not null,
  name text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, kind)
);

create table public.workspace_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.workspace_channels(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  parent_id uuid references public.workspace_messages(id) on delete cascade,
  message_kind public.message_kind not null default 'text',
  body text,
  file_paths text[] not null default '{}',
  pinned_at timestamptz,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  check (channel_id is not null or recipient_id is not null)
);

create table public.workspace_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.event_workspaces(id) on delete cascade,
  channel_id uuid references public.workspace_channels(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  storage_path text not null,
  file_kind text not null,
  created_at timestamptz not null default now()
);

create table public.workspace_message_reactions (
  message_id uuid not null references public.workspace_messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id, reaction)
);

create table public.workspace_read_receipts (
  message_id uuid not null references public.workspace_messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create table public.workspace_typing_indicators (
  channel_id uuid not null references public.workspace_channels(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (channel_id, profile_id)
);

create table public.workspace_meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.event_workspaces(id) on delete cascade,
  channel_id uuid references public.workspace_channels(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  status public.meeting_status not null default 'scheduled',
  starts_at timestamptz,
  ended_at timestamptz,
  recording_path text,
  notes text,
  captions_path text,
  screen_sharing_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workspace_meeting_attendance (
  meeting_id uuid not null references public.workspace_meetings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  raised_hand_at timestamptz,
  primary key (meeting_id, profile_id)
);

create table public.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  staff_profile_id uuid not null references public.staff_profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  role_title text not null,
  department public.workforce_category,
  status public.application_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  unique (event_id, staff_profile_id)
);

create table public.volunteer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  skills text[] not null default '{}',
  availability jsonb not null default '{}'::jsonb,
  profile_summary text,
  hours_completed numeric not null default 0,
  certificate_count integer not null default 0,
  rating_average numeric(3,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  volunteer_profile_id uuid not null references public.volunteer_profiles(id) on delete cascade,
  status public.application_status not null default 'submitted',
  selected_skills text[] not null default '{}',
  availability jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, volunteer_profile_id)
);

create table public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  assignment_id uuid references public.staff_assignments(id) on delete cascade,
  volunteer_application_id uuid references public.volunteer_applications(id) on delete cascade,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.shift_status not null default 'scheduled',
  check_in_at timestamptz,
  check_out_at timestamptz,
  hours_worked numeric not null default 0,
  supervisor_approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.staff_shifts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  occurred_at timestamptz not null default now(),
  notes text
);

create table public.gps_attendance (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.staff_shifts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  accuracy_meters numeric,
  verified boolean not null default false,
  supervisor_approved_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  staff_profile_id uuid references public.staff_profiles(id) on delete cascade,
  volunteer_profile_id uuid references public.volunteer_profiles(id) on delete cascade,
  attendance_score integer check (attendance_score between 1 and 5),
  task_score integer check (task_score between 1 and 5),
  rating integer not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now()
);

create table public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  incident_type text not null,
  severity public.incident_severity not null default 'medium',
  status public.incident_status not null default 'open',
  assigned_team public.workforce_category,
  title text not null,
  description text,
  resolution text,
  media_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.emergency_alerts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  triggered_by uuid not null references public.profiles(id) on delete cascade,
  severity public.incident_severity not null default 'critical',
  message text not null,
  target_teams public.workforce_category[] not null default '{}',
  acknowledged_by uuid[] not null default '{}',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.event_certificates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  certificate_type text not null,
  title text not null,
  storage_path text,
  issued_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.event_announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  audience text not null default 'all',
  title text not null,
  body text not null,
  urgent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organization_hierarchy (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  role_title text not null,
  parent_id uuid references public.organization_hierarchy(id) on delete set null,
  department public.workforce_category,
  created_at timestamptz not null default now()
);

create table public.approval_workflows (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  workflow_type text not null,
  target_table text,
  target_id uuid,
  requested_by uuid references public.profiles(id) on delete set null,
  approver_id uuid references public.profiles(id) on delete set null,
  status public.approval_status not null default 'pending',
  notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ticket_orders
  add constraint ticket_orders_promo_code_id_fkey
  foreign key (promo_code_id) references public.promo_codes(id) on delete set null;

alter table public.ticket_orders
  add constraint ticket_orders_affiliate_promoter_id_fkey
  foreign key (affiliate_promoter_id) references public.affiliate_promoters(id) on delete set null;

create table public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  parent_id uuid references public.event_comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  like_count integer not null default 0,
  pinned_at timestamptz,
  organizer_highlighted_at timestamptz,
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.event_comment_likes (
  comment_id uuid not null references public.event_comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, profile_id)
);

create table public.event_likes (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.event_views (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  viewed_at timestamptz not null default now()
);

create table public.event_interests (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.interest_status not null default 'interested',
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.saved_events (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.organizer_followers (
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organizer_id, profile_id)
);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.follow_target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (profile_id, target_type, target_id)
);

create table public.user_interests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.event_categories(id) on delete cascade,
  weight numeric not null default 1,
  created_at timestamptz not null default now(),
  primary key (profile_id, category_id)
);

create table public.event_communities (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  title text not null,
  rules text,
  created_at timestamptz not null default now()
);

create table public.community_channels (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.event_communities(id) on delete cascade,
  kind public.community_channel_kind not null,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (community_id, kind)
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.community_channels(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  media_urls text[] not null default '{}',
  pinned_at timestamptz,
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  parent_id uuid references public.community_comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.reels (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  organizer_id uuid references public.organizer_profiles(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  title text not null,
  caption text,
  video_url text not null,
  thumbnail_url text,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  share_count integer not null default 0,
  save_count integer not null default 0,
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.reel_likes (
  reel_id uuid not null references public.reels(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reel_id, profile_id)
);

create table public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  parent_id uuid references public.reel_comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  media_urls text[] not null default '{}',
  organizer_reply text,
  organizer_replied_at timestamptz,
  moderation_status public.moderation_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_table text not null,
  target_id uuid not null,
  reason text not null,
  status public.moderation_status not null default 'pending_review',
  created_at timestamptz not null default now()
);

create index events_status_starts_at_idx on public.events(status, starts_at);
create index events_organizer_id_idx on public.events(organizer_id);
create index events_trending_idx on public.events(trending_score desc, starts_at);
create index event_comments_event_id_created_at_idx on public.event_comments(event_id, created_at desc);
create index notifications_profile_id_created_at_idx on public.notifications(profile_id, created_at desc);
create index ticket_orders_buyer_id_idx on public.ticket_orders(buyer_id);
create index ticket_orders_event_id_created_at_idx on public.ticket_orders(event_id, created_at desc);
create index ticket_payments_order_id_idx on public.ticket_payments(ticket_order_id);
create index ticket_holders_owner_event_idx on public.ticket_holders(owner_id, event_id);
create index ticket_checkins_event_id_checked_in_at_idx on public.ticket_checkins(event_id, checked_in_at desc);
create index promo_codes_event_code_idx on public.promo_codes(event_id, code);
create index affiliate_promoters_event_code_idx on public.affiliate_promoters(event_id, code);
create index waitlists_event_status_idx on public.waitlists(event_id, status);
create index payout_requests_organizer_status_idx on public.payout_requests(organizer_id, status);
create index event_tasks_event_status_due_idx on public.event_tasks(event_id, status, due_at);
create index sponsor_applications_event_status_idx on public.sponsor_applications(event_id, status);
create index vendor_bookings_event_status_idx on public.vendor_bookings(event_id, status);
create index organizer_teams_organizer_role_idx on public.organizer_teams(organizer_id, role);
create index event_documents_event_type_idx on public.event_documents(event_id, document_type);
create index ai_generated_content_event_type_idx on public.ai_generated_content(event_id, content_type);
create index event_analytics_event_date_idx on public.event_analytics(event_id, metric_date desc);
create index workspace_channels_workspace_order_idx on public.workspace_channels(workspace_id, display_order);
create index workspace_messages_channel_created_idx on public.workspace_messages(channel_id, created_at desc);
create index staff_assignments_event_status_idx on public.staff_assignments(event_id, status);
create index volunteer_applications_event_status_idx on public.volunteer_applications(event_id, status);
create index staff_shifts_event_starts_idx on public.staff_shifts(event_id, starts_at);
create index incident_reports_event_status_idx on public.incident_reports(event_id, status, severity);
create index emergency_alerts_event_created_idx on public.emergency_alerts(event_id, created_at desc);
create index community_posts_channel_id_created_at_idx on public.community_posts(channel_id, created_at desc);
create index reels_created_at_idx on public.reels(created_at desc);
create index follows_profile_target_idx on public.follows(profile_id, target_type);

insert into public.event_categories (name, slug) values
  ('Music', 'music'),
  ('Gospel', 'gospel'),
  ('Sports', 'sports'),
  ('Business', 'business'),
  ('Technology', 'technology'),
  ('Fashion', 'fashion'),
  ('Comedy', 'comedy'),
  ('Festivals', 'festivals'),
  ('Conferences', 'conferences'),
  ('Nightlife', 'nightlife')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public) values
  ('event-media', 'event-media', true),
  ('organizer-assets', 'organizer-assets', true),
  ('venue-media', 'venue-media', true),
  ('community-media', 'community-media', true),
  ('verification-documents', 'verification-documents', false),
  ('event-documents', 'event-documents', false),
  ('workspace-files', 'workspace-files', false),
  ('workforce-documents', 'workforce-documents', false),
  ('incident-media', 'incident-media', false),
  ('certificates', 'certificates', false)
on conflict (id) do nothing;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security invoker
as $$
  select role from public.users where id = (select auth.uid())
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security invoker
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

create or replace function public.is_event_organizer(target_event_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.events e
    join public.organizer_profiles op on op.id = e.organizer_id
    where e.id = target_event_id
      and op.profile_id = (select auth.uid())
  )
$$;

create or replace function public.can_manage_event(target_event_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select public.is_super_admin()
    or public.is_event_organizer(target_event_id)
    or exists (
      select 1
      from public.staff_profiles sp
      join public.events e on e.organizer_id = sp.assigned_organizer_id
      where e.id = target_event_id
        and sp.profile_id = (select auth.uid())
    )
$$;

create or replace function public.is_organizer_owner(target_organizer_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.organizer_profiles op
      where op.id = target_organizer_id
        and op.profile_id = (select auth.uid())
    )
$$;

create or replace function public.can_manage_organizer(target_organizer_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.organizer_profiles op
      where op.id = target_organizer_id
        and op.profile_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.organizer_teams ot
      where ot.organizer_id = target_organizer_id
        and ot.profile_id = (select auth.uid())
        and ot.status = 'active'
    )
$$;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.event_categories enable row level security;
alter table public.organizer_profiles enable row level security;
alter table public.venue_profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_media enable row level security;
alter table public.ticket_types enable row level security;
alter table public.ticket_orders enable row level security;
alter table public.ticket_holders enable row level security;
alter table public.ticket_payments enable row level security;
alter table public.ticket_qr_codes enable row level security;
alter table public.ticket_wallet enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_code_usage enable row level security;
alter table public.affiliate_promoters enable row level security;
alter table public.affiliate_sales enable row level security;
alter table public.ticket_transfers enable row level security;
alter table public.ticket_refunds enable row level security;
alter table public.ticket_checkins enable row level security;
alter table public.event_capacity enable row level security;
alter table public.waitlists enable row level security;
alter table public.organizer_verification enable row level security;
alter table public.payout_requests enable row level security;
alter table public.event_tasks enable row level security;
alter table public.event_task_comments enable row level security;
alter table public.event_budgets enable row level security;
alter table public.event_expenses enable row level security;
alter table public.event_finances enable row level security;
alter table public.sponsors enable row level security;
alter table public.sponsor_applications enable row level security;
alter table public.sponsorship_contracts enable row level security;
alter table public.vendor_bookings enable row level security;
alter table public.vendor_reviews enable row level security;
alter table public.organizer_teams enable row level security;
alter table public.organizer_permissions enable row level security;
alter table public.event_documents enable row level security;
alter table public.ai_generated_content enable row level security;
alter table public.event_analytics enable row level security;
alter table public.event_workspaces enable row level security;
alter table public.workspace_channels enable row level security;
alter table public.workspace_messages enable row level security;
alter table public.workspace_files enable row level security;
alter table public.workspace_message_reactions enable row level security;
alter table public.workspace_read_receipts enable row level security;
alter table public.workspace_typing_indicators enable row level security;
alter table public.workspace_meetings enable row level security;
alter table public.workspace_meeting_attendance enable row level security;
alter table public.staff_assignments enable row level security;
alter table public.volunteer_profiles enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.staff_shifts enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.gps_attendance enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.incident_reports enable row level security;
alter table public.emergency_alerts enable row level security;
alter table public.event_certificates enable row level security;
alter table public.event_announcements enable row level security;
alter table public.organization_hierarchy enable row level security;
alter table public.approval_workflows enable row level security;
alter table public.event_comments enable row level security;
alter table public.event_comment_likes enable row level security;
alter table public.event_likes enable row level security;
alter table public.event_views enable row level security;
alter table public.event_interests enable row level security;
alter table public.saved_events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.notifications enable row level security;
alter table public.organizer_followers enable row level security;
alter table public.follows enable row level security;
alter table public.user_interests enable row level security;
alter table public.event_communities enable row level security;
alter table public.community_channels enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.reels enable row level security;
alter table public.reel_likes enable row level security;
alter table public.reel_comments enable row level security;
alter table public.event_reviews enable row level security;
alter table public.content_reports enable row level security;

create policy "users_read_own_or_admin" on public.users
for select to authenticated
using (id = (select auth.uid()) or public.is_super_admin());

create policy "users_insert_own" on public.users
for insert to authenticated
with check (id = (select auth.uid()));

create policy "users_admin_update" on public.users
for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "profiles_read_public" on public.profiles
for select to authenticated
using (true);

create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
for update to authenticated
using ((select auth.uid()) = id or public.is_super_admin())
with check ((select auth.uid()) = id or public.is_super_admin());

create policy "categories_read" on public.event_categories
for select to authenticated
using (true);

create policy "categories_admin_write" on public.event_categories
for all to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "organizers_read" on public.organizer_profiles
for select to authenticated
using (true);

create policy "organizers_insert_own" on public.organizer_profiles
for insert to authenticated
with check ((select auth.uid()) = profile_id);

create policy "organizers_update_own_or_admin" on public.organizer_profiles
for update to authenticated
using ((select auth.uid()) = profile_id or public.is_super_admin())
with check ((select auth.uid()) = profile_id or public.is_super_admin());

create policy "venues_read" on public.venue_profiles
for select to authenticated
using (true);

create policy "venues_insert_authenticated" on public.venue_profiles
for insert to authenticated
with check (created_by = (select auth.uid()) or public.is_super_admin());

create policy "venues_update_creator_or_admin" on public.venue_profiles
for update to authenticated
using (created_by = (select auth.uid()) or public.is_super_admin())
with check (created_by = (select auth.uid()) or public.is_super_admin());

create policy "vendors_read" on public.vendors
for select to authenticated
using (true);

create policy "vendors_insert_own" on public.vendors
for insert to authenticated
with check ((select auth.uid()) = profile_id);

create policy "vendors_update_own_or_admin" on public.vendors
for update to authenticated
using ((select auth.uid()) = profile_id or public.is_super_admin())
with check ((select auth.uid()) = profile_id or public.is_super_admin());

create policy "staff_read_own_or_admin" on public.staff_profiles
for select to authenticated
using ((select auth.uid()) = profile_id or public.is_super_admin());

create policy "staff_insert_own" on public.staff_profiles
for insert to authenticated
with check ((select auth.uid()) = profile_id);

create policy "events_read_published" on public.events
for select to authenticated
using (
  status = 'published'
  or public.is_super_admin()
  or exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "events_organizer_insert" on public.events
for insert to authenticated
with check (
  exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "events_organizer_update" on public.events
for update to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "event_media_read_for_visible_events" on public.event_media
for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id));

create policy "event_media_organizer_write" on public.event_media
for all to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1 from public.events e
    join public.organizer_profiles op on op.id = e.organizer_id
    where e.id = event_id and op.profile_id = (select auth.uid())
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1 from public.events e
    join public.organizer_profiles op on op.id = e.organizer_id
    where e.id = event_id and op.profile_id = (select auth.uid())
  )
);

create policy "ticket_types_read_for_visible_events" on public.ticket_types
for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id));

create policy "ticket_types_organizer_write" on public.ticket_types
for all to authenticated
using (public.is_event_organizer(event_id) or public.is_super_admin())
with check (public.is_event_organizer(event_id) or public.is_super_admin());

create policy "orders_read_own_or_admin" on public.ticket_orders
for select to authenticated
using (buyer_id = (select auth.uid()) or public.can_manage_event(event_id));

create policy "orders_insert_own" on public.ticket_orders
for insert to authenticated
with check (buyer_id = (select auth.uid()));

create policy "orders_update_manager" on public.ticket_orders
for update to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "holders_read_for_buyer" on public.ticket_holders
for select to authenticated
using (
  owner_id = (select auth.uid())
  or public.can_manage_event(event_id)
);

create policy "holders_insert_from_own_order" on public.ticket_holders
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.ticket_orders o
    where o.id = ticket_order_id and o.buyer_id = (select auth.uid())
  )
);

create policy "holders_update_manager_or_owner_transfer" on public.ticket_holders
for update to authenticated
using (owner_id = (select auth.uid()) or public.can_manage_event(event_id))
with check (owner_id = (select auth.uid()) or public.can_manage_event(event_id));

create policy "payments_read_buyer_or_manager" on public.ticket_payments
for select to authenticated
using (
  buyer_id = (select auth.uid())
  or exists (
    select 1 from public.ticket_orders o
    where o.id = ticket_order_id and public.can_manage_event(o.event_id)
  )
);

create policy "payments_insert_buyer" on public.ticket_payments
for insert to authenticated
with check (buyer_id = (select auth.uid()));

create policy "payments_manager_update" on public.ticket_payments
for update to authenticated
using (
  exists (
    select 1 from public.ticket_orders o
    where o.id = ticket_order_id and public.can_manage_event(o.event_id)
  )
)
with check (
  exists (
    select 1 from public.ticket_orders o
    where o.id = ticket_order_id and public.can_manage_event(o.event_id)
  )
);

create policy "qr_codes_read_owner_or_manager" on public.ticket_qr_codes
for select to authenticated
using (
  exists (
    select 1 from public.ticket_holders th
    where th.id = ticket_holder_id
      and (th.owner_id = (select auth.uid()) or public.can_manage_event(th.event_id))
  )
);

create policy "ticket_wallet_read_own" on public.ticket_wallet
for select to authenticated
using (profile_id = (select auth.uid()));

create policy "promo_codes_manager_all" on public.promo_codes
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "promo_code_usage_read_own_or_manager" on public.promo_code_usage
for select to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.ticket_orders o
    where o.id = ticket_order_id and public.can_manage_event(o.event_id)
  )
);

create policy "promo_code_usage_insert_own" on public.promo_code_usage
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "affiliate_promoters_manager_all" on public.affiliate_promoters
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "affiliate_sales_manager_read" on public.affiliate_sales
for select to authenticated
using (
  exists (
    select 1 from public.affiliate_promoters ap
    where ap.id = affiliate_promoter_id and public.can_manage_event(ap.event_id)
  )
);

create policy "transfers_read_participants_or_manager" on public.ticket_transfers
for select to authenticated
using (
  from_profile_id = (select auth.uid())
  or to_profile_id = (select auth.uid())
  or exists (
    select 1 from public.ticket_holders th
    where th.id = ticket_holder_id and public.can_manage_event(th.event_id)
  )
);

create policy "transfers_insert_owner" on public.ticket_transfers
for insert to authenticated
with check (
  from_profile_id = (select auth.uid())
  and exists (
    select 1 from public.ticket_holders th
    where th.id = ticket_holder_id and th.owner_id = (select auth.uid())
  )
);

create policy "transfers_update_participants_or_manager" on public.ticket_transfers
for update to authenticated
using (from_profile_id = (select auth.uid()) or to_profile_id = (select auth.uid()) or public.is_super_admin())
with check (from_profile_id = (select auth.uid()) or to_profile_id = (select auth.uid()) or public.is_super_admin());

create policy "refunds_read_requester_or_manager" on public.ticket_refunds
for select to authenticated
using (requester_id = (select auth.uid()) or public.can_manage_event(event_id));

create policy "refunds_insert_requester" on public.ticket_refunds
for insert to authenticated
with check (requester_id = (select auth.uid()));

create policy "refunds_manager_update" on public.ticket_refunds
for update to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "checkins_read_manager" on public.ticket_checkins
for select to authenticated
using (public.can_manage_event(event_id));

create policy "checkins_insert_manager" on public.ticket_checkins
for insert to authenticated
with check (public.can_manage_event(event_id));

create policy "capacity_read_visible" on public.event_capacity
for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id));

create policy "capacity_manager_update" on public.event_capacity
for update to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "waitlists_read_own_or_manager" on public.waitlists
for select to authenticated
using (profile_id = (select auth.uid()) or public.can_manage_event(event_id));

create policy "waitlists_insert_own" on public.waitlists
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "waitlists_manager_update" on public.waitlists
for update to authenticated
using (profile_id = (select auth.uid()) or public.can_manage_event(event_id))
with check (profile_id = (select auth.uid()) or public.can_manage_event(event_id));

create policy "verification_read_owner_or_admin" on public.organizer_verification
for select to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "verification_insert_owner" on public.organizer_verification
for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "verification_admin_update" on public.organizer_verification
for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "payouts_read_owner_or_admin" on public.payout_requests
for select to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "payouts_insert_owner" on public.payout_requests
for insert to authenticated
with check (
  requested_by = (select auth.uid())
  and exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "payouts_admin_update" on public.payout_requests
for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "event_tasks_manager_all" on public.event_tasks
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "event_task_comments_manager_all" on public.event_task_comments
for all to authenticated
using (
  exists (
    select 1 from public.event_tasks t
    where t.id = task_id and public.can_manage_event(t.event_id)
  )
)
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1 from public.event_tasks t
    where t.id = task_id and public.can_manage_event(t.event_id)
  )
);

create policy "event_budgets_manager_all" on public.event_budgets
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "event_expenses_manager_all" on public.event_expenses
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "event_finances_manager_all" on public.event_finances
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "sponsors_read" on public.sponsors
for select to authenticated
using (true);

create policy "sponsors_insert_owner" on public.sponsors
for insert to authenticated
with check (profile_id = (select auth.uid()) or public.is_super_admin());

create policy "sponsors_update_owner_or_admin" on public.sponsors
for update to authenticated
using (profile_id = (select auth.uid()) or public.is_super_admin())
with check (profile_id = (select auth.uid()) or public.is_super_admin());

create policy "sponsor_applications_read_participants" on public.sponsor_applications
for select to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.sponsors s
    where s.id = sponsor_id and s.profile_id = (select auth.uid())
  )
);

create policy "sponsor_applications_insert_sponsor" on public.sponsor_applications
for insert to authenticated
with check (
  exists (
    select 1 from public.sponsors s
    where s.id = sponsor_id and s.profile_id = (select auth.uid())
  )
);

create policy "sponsor_applications_update_participants" on public.sponsor_applications
for update to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.sponsors s
    where s.id = sponsor_id and s.profile_id = (select auth.uid())
  )
)
with check (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.sponsors s
    where s.id = sponsor_id and s.profile_id = (select auth.uid())
  )
);

create policy "sponsorship_contracts_read_participants" on public.sponsorship_contracts
for select to authenticated
using (
  exists (
    select 1 from public.sponsor_applications sa
    join public.sponsors s on s.id = sa.sponsor_id
    where sa.id = sponsor_application_id
      and (public.can_manage_event(sa.event_id) or s.profile_id = (select auth.uid()))
  )
);

create policy "sponsorship_contracts_manager_insert_update" on public.sponsorship_contracts
for all to authenticated
using (
  exists (
    select 1 from public.sponsor_applications sa
    where sa.id = sponsor_application_id and public.can_manage_event(sa.event_id)
  )
)
with check (
  exists (
    select 1 from public.sponsor_applications sa
    where sa.id = sponsor_application_id and public.can_manage_event(sa.event_id)
  )
);

create policy "vendor_bookings_read_participants" on public.vendor_bookings
for select to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.profile_id = (select auth.uid())
  )
);

create policy "vendor_bookings_insert_manager" on public.vendor_bookings
for insert to authenticated
with check (public.can_manage_event(event_id));

create policy "vendor_bookings_update_participants" on public.vendor_bookings
for update to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.profile_id = (select auth.uid())
  )
)
with check (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.profile_id = (select auth.uid())
  )
);

create policy "vendor_reviews_read" on public.vendor_reviews
for select to authenticated
using (true);

create policy "vendor_reviews_insert_manager" on public.vendor_reviews
for insert to authenticated
with check (reviewer_id = (select auth.uid()) and public.can_manage_event(event_id));

create policy "organizer_teams_read_members" on public.organizer_teams
for select to authenticated
using (public.is_organizer_owner(organizer_id) or profile_id = (select auth.uid()));

create policy "organizer_teams_owner_write" on public.organizer_teams
for all to authenticated
using (public.is_organizer_owner(organizer_id))
with check (public.is_organizer_owner(organizer_id));

create policy "organizer_permissions_read_team" on public.organizer_permissions
for select to authenticated
using (
  exists (
    select 1 from public.organizer_teams ot
    where ot.id = team_member_id and public.is_organizer_owner(ot.organizer_id)
  )
);

create policy "organizer_permissions_owner_write" on public.organizer_permissions
for all to authenticated
using (
  exists (
    select 1 from public.organizer_teams ot
    where ot.id = team_member_id and public.is_organizer_owner(ot.organizer_id)
  )
)
with check (
  exists (
    select 1 from public.organizer_teams ot
    where ot.id = team_member_id and public.is_organizer_owner(ot.organizer_id)
  )
);

create policy "event_documents_manager_all" on public.event_documents
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "ai_generated_content_manager_all" on public.ai_generated_content
for all to authenticated
using (
  profile_id = (select auth.uid())
  or public.is_super_admin()
  or (event_id is not null and public.can_manage_event(event_id))
  or (organizer_id is not null and public.can_manage_organizer(organizer_id))
)
with check (
  profile_id = (select auth.uid())
  or public.is_super_admin()
  or (event_id is not null and public.can_manage_event(event_id))
  or (organizer_id is not null and public.can_manage_organizer(organizer_id))
);

create policy "event_analytics_manager_read" on public.event_analytics
for select to authenticated
using (public.can_manage_event(event_id));

create policy "event_analytics_manager_write" on public.event_analytics
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "workspaces_manager_read" on public.event_workspaces
for select to authenticated
using (public.can_manage_event(event_id));

create policy "workspace_channels_manager_read" on public.workspace_channels
for select to authenticated
using (
  exists (
    select 1 from public.event_workspaces ew
    where ew.id = workspace_id and public.can_manage_event(ew.event_id)
  )
);

create policy "workspace_messages_participants_all" on public.workspace_messages
for all to authenticated
using (
  sender_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or exists (
    select 1 from public.workspace_channels wc
    join public.event_workspaces ew on ew.id = wc.workspace_id
    where wc.id = channel_id and public.can_manage_event(ew.event_id)
  )
)
with check (
  sender_id = (select auth.uid())
  and (
    recipient_id is not null
    or exists (
      select 1 from public.workspace_channels wc
      join public.event_workspaces ew on ew.id = wc.workspace_id
      where wc.id = channel_id and public.can_manage_event(ew.event_id)
    )
  )
);

create policy "workspace_files_manager_all" on public.workspace_files
for all to authenticated
using (
  exists (
    select 1 from public.event_workspaces ew
    where ew.id = workspace_id and public.can_manage_event(ew.event_id)
  )
)
with check (
  exists (
    select 1 from public.event_workspaces ew
    where ew.id = workspace_id and public.can_manage_event(ew.event_id)
  )
);

create policy "workspace_reactions_own" on public.workspace_message_reactions
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "workspace_receipts_own" on public.workspace_read_receipts
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "workspace_typing_own" on public.workspace_typing_indicators
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "workspace_meetings_manager_all" on public.workspace_meetings
for all to authenticated
using (
  exists (
    select 1 from public.event_workspaces ew
    where ew.id = workspace_id and public.can_manage_event(ew.event_id)
  )
)
with check (
  exists (
    select 1 from public.event_workspaces ew
    where ew.id = workspace_id and public.can_manage_event(ew.event_id)
  )
);

create policy "meeting_attendance_own_or_manager" on public.workspace_meeting_attendance
for all to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.workspace_meetings wm
    join public.event_workspaces ew on ew.id = wm.workspace_id
    where wm.id = meeting_id and public.can_manage_event(ew.event_id)
  )
)
with check (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.workspace_meetings wm
    join public.event_workspaces ew on ew.id = wm.workspace_id
    where wm.id = meeting_id and public.can_manage_event(ew.event_id)
  )
);

create policy "staff_assignments_manager_or_assigned" on public.staff_assignments
for all to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.staff_profiles sp
    where sp.id = staff_profile_id and sp.profile_id = (select auth.uid())
  )
)
with check (public.can_manage_event(event_id));

create policy "volunteer_profiles_own" on public.volunteer_profiles
for all to authenticated
using (profile_id = (select auth.uid()) or public.is_super_admin())
with check (profile_id = (select auth.uid()) or public.is_super_admin());

create policy "volunteer_applications_own_or_manager" on public.volunteer_applications
for all to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.volunteer_profiles vp
    where vp.id = volunteer_profile_id and vp.profile_id = (select auth.uid())
  )
)
with check (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.volunteer_profiles vp
    where vp.id = volunteer_profile_id and vp.profile_id = (select auth.uid())
  )
);

create policy "shifts_manager_or_assigned" on public.staff_shifts
for all to authenticated
using (
  public.can_manage_event(event_id)
  or exists (
    select 1 from public.staff_assignments sa
    join public.staff_profiles sp on sp.id = sa.staff_profile_id
    where sa.id = assignment_id and sp.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.volunteer_applications va
    join public.volunteer_profiles vp on vp.id = va.volunteer_profile_id
    where va.id = volunteer_application_id and vp.profile_id = (select auth.uid())
  )
)
with check (public.can_manage_event(event_id));

create policy "attendance_logs_own_or_manager" on public.attendance_logs
for all to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.staff_shifts ss
    where ss.id = shift_id and public.can_manage_event(ss.event_id)
  )
)
with check (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.staff_shifts ss
    where ss.id = shift_id and public.can_manage_event(ss.event_id)
  )
);

create policy "gps_attendance_own_or_manager" on public.gps_attendance
for all to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.staff_shifts ss
    where ss.id = shift_id and public.can_manage_event(ss.event_id)
  )
)
with check (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.staff_shifts ss
    where ss.id = shift_id and public.can_manage_event(ss.event_id)
  )
);

create policy "performance_reviews_manager_or_subject" on public.performance_reviews
for all to authenticated
using (
  public.can_manage_event(event_id)
  or exists (select 1 from public.staff_profiles sp where sp.id = staff_profile_id and sp.profile_id = (select auth.uid()))
  or exists (select 1 from public.volunteer_profiles vp where vp.id = volunteer_profile_id and vp.profile_id = (select auth.uid()))
)
with check (public.can_manage_event(event_id));

create policy "incidents_manager_all" on public.incident_reports
for all to authenticated
using (public.can_manage_event(event_id) or reporter_id = (select auth.uid()))
with check (public.can_manage_event(event_id) or reporter_id = (select auth.uid()));

create policy "emergency_alerts_manager_read_write" on public.emergency_alerts
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "certificates_owner_or_manager" on public.event_certificates
for all to authenticated
using (profile_id = (select auth.uid()) or public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "announcements_visible_to_event_team" on public.event_announcements
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "org_hierarchy_manager_all" on public.organization_hierarchy
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "approval_workflows_manager_all" on public.approval_workflows
for all to authenticated
using (public.can_manage_event(event_id) or requested_by = (select auth.uid()) or approver_id = (select auth.uid()))
with check (public.can_manage_event(event_id) or requested_by = (select auth.uid()));

create policy "comments_read_visible_events" on public.event_comments
for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id));

create policy "comments_insert_own" on public.event_comments
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "comments_update_own_or_admin" on public.event_comments
for update to authenticated
using (profile_id = (select auth.uid()) or public.is_super_admin())
with check (profile_id = (select auth.uid()) or public.is_super_admin());

create policy "comment_likes_manage_own" on public.event_comment_likes
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "likes_manage_own" on public.event_likes
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "views_insert" on public.event_views
for insert to authenticated
with check (profile_id is null or profile_id = (select auth.uid()));

create policy "interests_manage_own" on public.event_interests
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "saved_events_manage_own" on public.saved_events
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "attendees_manage_own" on public.event_attendees
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "notifications_read_own" on public.notifications
for select to authenticated
using (profile_id = (select auth.uid()));

create policy "notifications_update_own" on public.notifications
for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "organizer_followers_manage_own" on public.organizer_followers
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "follows_manage_own" on public.follows
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "user_interests_manage_own" on public.user_interests
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "communities_read_visible_events" on public.event_communities
for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id));

create policy "communities_admin_update" on public.event_communities
for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "channels_read_visible_communities" on public.community_channels
for select to authenticated
using (
  exists (
    select 1 from public.event_communities ec
    join public.events e on e.id = ec.event_id
    where ec.id = community_id
  )
);

create policy "community_posts_read_active" on public.community_posts
for select to authenticated
using (moderation_status = 'active' or public.is_super_admin());

create policy "community_posts_insert_own" on public.community_posts
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "community_posts_update_own_or_admin" on public.community_posts
for update to authenticated
using (profile_id = (select auth.uid()) or public.is_super_admin())
with check (profile_id = (select auth.uid()) or public.is_super_admin());

create policy "community_comments_read_active" on public.community_comments
for select to authenticated
using (moderation_status = 'active' or public.is_super_admin());

create policy "community_comments_insert_own" on public.community_comments
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "reels_read_active" on public.reels
for select to authenticated
using (moderation_status = 'active' or public.is_super_admin());

create policy "reels_insert_own_or_organizer" on public.reels
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.organizer_profiles op
    where op.id = organizer_id and op.profile_id = (select auth.uid())
  )
);

create policy "reel_likes_manage_own" on public.reel_likes
for all to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "reel_comments_read_active" on public.reel_comments
for select to authenticated
using (moderation_status = 'active' or public.is_super_admin());

create policy "reel_comments_insert_own" on public.reel_comments
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "event_reviews_read_active" on public.event_reviews
for select to authenticated
using (moderation_status = 'active' or public.is_super_admin());

create policy "event_reviews_insert_own" on public.event_reviews
for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "event_reviews_update_organizer_reply_or_admin" on public.event_reviews
for update to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1 from public.events e
    join public.organizer_profiles op on op.id = e.organizer_id
    where e.id = event_id and op.profile_id = (select auth.uid())
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1 from public.events e
    join public.organizer_profiles op on op.id = e.organizer_id
    where e.id = event_id and op.profile_id = (select auth.uid())
  )
);

create policy "content_reports_insert_own" on public.content_reports
for insert to authenticated
with check (reporter_id = (select auth.uid()));

create policy "content_reports_admin_read_update" on public.content_reports
for all to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "event_media_storage_read" on storage.objects
for select to authenticated
using (bucket_id in ('event-media', 'organizer-assets', 'venue-media', 'community-media'));

create policy "event_media_storage_upload" on storage.objects
for insert to authenticated
with check (
  bucket_id in ('event-media', 'organizer-assets', 'venue-media', 'community-media')
  and owner = (select auth.uid())
);

create policy "event_media_storage_update_own" on storage.objects
for update to authenticated
using (
  bucket_id in ('event-media', 'organizer-assets', 'venue-media', 'community-media')
  and owner = (select auth.uid())
)
with check (
  bucket_id in ('event-media', 'organizer-assets', 'venue-media', 'community-media')
  and owner = (select auth.uid())
);

create policy "verification_documents_read_owner_or_admin" on storage.objects
for select to authenticated
using (
  bucket_id = 'verification-documents'
  and (
    owner = (select auth.uid())
    or public.is_super_admin()
  )
);

create policy "verification_documents_upload_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'verification-documents'
  and owner = (select auth.uid())
);

create policy "event_documents_read_manager" on storage.objects
for select to authenticated
using (
  bucket_id = 'event-documents'
  and (
    owner = (select auth.uid())
    or public.is_super_admin()
  )
);

create policy "event_documents_upload_manager" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'event-documents'
  and owner = (select auth.uid())
);

create policy "operations_storage_read_owner_or_admin" on storage.objects
for select to authenticated
using (
  bucket_id in ('workspace-files', 'workforce-documents', 'incident-media', 'certificates')
  and (owner = (select auth.uid()) or public.is_super_admin())
);

create policy "operations_storage_upload_own" on storage.objects
for insert to authenticated
with check (
  bucket_id in ('workspace-files', 'workforce-documents', 'incident-media', 'certificates')
  and owner = (select auth.uid())
);

create policy "operations_storage_update_own" on storage.objects
for update to authenticated
using (
  bucket_id in ('workspace-files', 'workforce-documents', 'incident-media', 'certificates')
  and owner = (select auth.uid())
)
with check (
  bucket_id in ('workspace-files', 'workforce-documents', 'incident-media', 'certificates')
  and owner = (select auth.uid())
);

create schema if not exists private;

create or replace function private.create_event_community()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  new_community_id uuid;
begin
  insert into public.event_communities (event_id, title, rules)
  values (new.id, new.title || ' Community', 'Respect attendees, organizers, venues, and Kenyan law.')
  returning id into new_community_id;

  insert into public.community_channels (community_id, kind, name, display_order) values
    (new_community_id, 'general', 'General', 10),
    (new_community_id, 'announcements', 'Announcements', 20),
    (new_community_id, 'questions', 'Questions', 30),
    (new_community_id, 'photos', 'Photos', 40),
    (new_community_id, 'networking', 'Networking', 50),
    (new_community_id, 'transport', 'Transport', 60),
    (new_community_id, 'food', 'Food', 70),
    (new_community_id, 'support', 'Support', 80);

  return new;
end;
$$;

revoke all on function private.create_event_community() from public;

create trigger create_event_community_after_event_insert
after insert on public.events
for each row execute function private.create_event_community();

create or replace function private.create_event_workspace()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  new_workspace_id uuid;
begin
  insert into public.event_workspaces (event_id, organizer_id, name)
  values (new.id, new.organizer_id, new.title || ' Workspace')
  returning id into new_workspace_id;

  insert into public.workspace_channels (workspace_id, kind, name, display_order) values
    (new_workspace_id, 'general', 'General', 10),
    (new_workspace_id, 'announcements', 'Announcements', 20),
    (new_workspace_id, 'operations', 'Operations', 30),
    (new_workspace_id, 'ticketing', 'Ticketing', 40),
    (new_workspace_id, 'security', 'Security', 50),
    (new_workspace_id, 'vip', 'VIP', 60),
    (new_workspace_id, 'sponsors', 'Sponsors', 70),
    (new_workspace_id, 'vendors', 'Vendors', 80),
    (new_workspace_id, 'food_vendors', 'Food Vendors', 90),
    (new_workspace_id, 'transport', 'Transport', 100),
    (new_workspace_id, 'media', 'Media', 110),
    (new_workspace_id, 'emergency', 'Emergency', 120),
    (new_workspace_id, 'lost_found', 'Lost & Found', 130),
    (new_workspace_id, 'support', 'Support', 140),
    (new_workspace_id, 'staff', 'Staff', 150),
    (new_workspace_id, 'volunteers', 'Volunteers', 160);

  return new;
end;
$$;

revoke all on function private.create_event_workspace() from public;

create trigger create_event_workspace_after_event_insert
after insert on public.events
for each row execute function private.create_event_workspace();

create or replace function private.notify_followers_new_event()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.status = 'published' then
    insert into public.notifications (profile_id, title, body, data)
    select
      ofo.profile_id,
      'New event posted',
      new.title,
      jsonb_build_object('event_id', new.id, 'organizer_id', new.organizer_id, 'type', 'followed_organizer_event')
    from public.organizer_followers ofo
    where ofo.organizer_id = new.organizer_id;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_followers_new_event() from public;

create trigger notify_followers_new_event_after_insert
after insert on public.events
for each row execute function private.notify_followers_new_event();

create or replace function private.notify_followers_published_event()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.status is distinct from new.status and new.status = 'published' then
    insert into public.notifications (profile_id, title, body, data)
    select
      ofo.profile_id,
      'New event posted',
      new.title,
      jsonb_build_object('event_id', new.id, 'organizer_id', new.organizer_id, 'type', 'followed_organizer_event')
    from public.organizer_followers ofo
    where ofo.organizer_id = new.organizer_id;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_followers_published_event() from public;

create trigger notify_followers_published_event_after_update
after update of status on public.events
for each row execute function private.notify_followers_published_event();

create or replace function private.notify_event_date_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.starts_at is distinct from new.starts_at then
    insert into public.notifications (profile_id, title, body, data)
    select
      ei.profile_id,
      'Event date changed',
      new.title,
      jsonb_build_object('event_id', new.id, 'type', 'event_date_changed')
    from public.event_interests ei
    where ei.event_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_event_date_change() from public;

create trigger notify_event_date_change_after_update
after update of starts_at on public.events
for each row execute function private.notify_event_date_change();

create or replace function private.create_capacity_after_event_insert()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.capacity_total is not null then
    insert into public.event_capacity (event_id, capacity_total)
    values (new.id, new.capacity_total)
    on conflict (event_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.create_capacity_after_event_insert() from public;

create trigger create_capacity_after_event_insert
after insert on public.events
for each row execute function private.create_capacity_after_event_insert();

create or replace function private.issue_ticket_qr_and_wallet()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  raw_nonce text;
begin
  raw_nonce := encode(gen_random_bytes(32), 'hex');

  insert into public.ticket_qr_codes (ticket_holder_id, qr_nonce_hash, qr_version)
  values (new.id, encode(digest(raw_nonce, 'sha256'), 'hex'), new.qr_version);

  insert into public.ticket_wallet (profile_id, ticket_holder_id, event_id, ticket_type_id, status, wallet_section)
  values (
    new.owner_id,
    new.id,
    new.event_id,
    new.ticket_type_id,
    new.status,
    case when new.status in ('cancelled', 'refunded') then 'cancelled' else 'upcoming' end
  )
  on conflict (ticket_holder_id) do update
    set status = excluded.status,
        wallet_section = excluded.wallet_section;

  return new;
end;
$$;

revoke all on function private.issue_ticket_qr_and_wallet() from public;

create trigger issue_ticket_qr_and_wallet_after_ticket_insert
after insert on public.ticket_holders
for each row execute function private.issue_ticket_qr_and_wallet();

create or replace function private.sync_ticket_wallet_status()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  update public.ticket_wallet
  set status = new.status,
      wallet_section = case
        when new.status in ('cancelled', 'refunded') then 'cancelled'
        when new.status = 'transferred' then 'transferred'
        when new.status = 'used' then 'past'
        else 'upcoming'
      end
  where ticket_holder_id = new.id;

  return new;
end;
$$;

revoke all on function private.sync_ticket_wallet_status() from public;

create trigger sync_ticket_wallet_status_after_ticket_update
after update of status on public.ticket_holders
for each row execute function private.sync_ticket_wallet_status();

create or replace function private.prevent_invalid_checkin()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  current_status public.ticket_status;
begin
  select status into current_status
  from public.ticket_holders
  where id = new.ticket_holder_id
  for update;

  if current_status is distinct from 'active' then
    raise exception 'Ticket is not valid for check-in';
  end if;

  update public.ticket_holders
  set status = 'used',
      checked_in_at = new.checked_in_at
  where id = new.ticket_holder_id;

  return new;
end;
$$;

revoke all on function private.prevent_invalid_checkin() from public;

create trigger prevent_invalid_checkin_before_insert
before insert on public.ticket_checkins
for each row execute function private.prevent_invalid_checkin();

create or replace function private.update_sales_after_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.status is distinct from new.status and new.status = 'paid' then
    update public.event_capacity
    set sold_count = sold_count + new.quantity,
        reserved_count = greatest(reserved_count - new.quantity, 0),
        updated_at = now()
    where event_id = new.event_id;
  end if;

  return new;
end;
$$;

revoke all on function private.update_sales_after_paid_order() from public;

create trigger update_sales_after_paid_order
after update of status on public.ticket_orders
for each row execute function private.update_sales_after_paid_order();

create or replace function private.notify_task_assignee()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.assigned_to is not null then
    insert into public.notifications (profile_id, title, body, data)
    values (
      new.assigned_to,
      'New event task assigned',
      new.title,
      jsonb_build_object('event_id', new.event_id, 'task_id', new.id, 'type', 'event_task_assigned')
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_task_assignee() from public;

create trigger notify_task_assignee_after_insert
after insert on public.event_tasks
for each row execute function private.notify_task_assignee();

create or replace function private.notify_budget_overrun()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.actual_cents > new.budgeted_cents and old.actual_cents is distinct from new.actual_cents then
    insert into public.notifications (profile_id, title, body, data)
    select
      op.profile_id,
      'Budget overrun',
      new.category,
      jsonb_build_object('event_id', new.event_id, 'budget_id', new.id, 'type', 'budget_overrun')
    from public.events e
    join public.organizer_profiles op on op.id = e.organizer_id
    where e.id = new.event_id;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_budget_overrun() from public;

create trigger notify_budget_overrun_after_update
after update of actual_cents on public.event_budgets
for each row execute function private.notify_budget_overrun();

create or replace function private.notify_emergency_alert()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.notifications (profile_id, title, body, data)
  select
    op.profile_id,
    'Emergency alert',
    new.message,
    jsonb_build_object('event_id', new.event_id, 'alert_id', new.id, 'type', 'emergency_alert')
  from public.events e
  join public.organizer_profiles op on op.id = e.organizer_id
  where e.id = new.event_id;

  insert into public.notifications (profile_id, title, body, data)
  select
    sp.profile_id,
    'Emergency alert',
    new.message,
    jsonb_build_object('event_id', new.event_id, 'alert_id', new.id, 'type', 'emergency_alert')
  from public.staff_assignments sa
  join public.staff_profiles sp on sp.id = sa.staff_profile_id
  where sa.event_id = new.event_id;

  return new;
end;
$$;

revoke all on function private.notify_emergency_alert() from public;

create trigger notify_emergency_alert_after_insert
after insert on public.emergency_alerts
for each row execute function private.notify_emergency_alert();

create or replace view public.recommended_events
with (security_invoker = true)
as
select
  e.*,
  (
    coalesce(e.trending_score, 0)
    + coalesce(e.interested_count, 0) * 0.5
    + coalesce(e.going_count, 0)
    + coalesce(e.save_count, 0) * 0.75
    + case when ui.category_id is not null then 12 else 0 end
    + case when ofo.profile_id is not null then 18 else 0 end
  ) as recommendation_score
from public.events e
left join public.user_interests ui
  on ui.category_id = e.category_id and ui.profile_id = (select auth.uid())
left join public.organizer_followers ofo
  on ofo.organizer_id = e.organizer_id and ofo.profile_id = (select auth.uid())
where e.status = 'published' and e.visibility = 'public';

create or replace view public.organizer_ticket_dashboard
with (security_invoker = true)
as
select
  e.id as event_id,
  e.title,
  e.organizer_id,
  coalesce(ec.capacity_total, e.capacity_total, 0) as capacity_total,
  coalesce(sum(tt.quantity_total), 0) as tickets_available,
  coalesce(sum(tt.quantity_sold), 0) as tickets_sold,
  coalesce(sum(case when tor.status = 'paid' then tor.total_cents else 0 end), 0) as gross_revenue_cents,
  coalesce(sum(case when tor.status = 'pending_payment' then tor.total_cents else 0 end), 0) as pending_payments_cents,
  count(distinct tc.id) as checked_in_attendees,
  case
    when coalesce(sum(tt.quantity_sold), 0) = 0 then 0
    else round((count(distinct tc.id)::numeric / nullif(sum(tt.quantity_sold), 0)) * 100, 2)
  end as attendance_percentage
from public.events e
left join public.event_capacity ec on ec.event_id = e.id
left join public.ticket_types tt on tt.event_id = e.id
left join public.ticket_orders tor on tor.event_id = e.id
left join public.ticket_checkins tc on tc.event_id = e.id
where public.can_manage_event(e.id)
group by e.id, e.title, e.organizer_id, ec.capacity_total;

create or replace view public.organizer_revenue_dashboard
with (security_invoker = true)
as
select
  e.id as event_id,
  e.title,
  e.organizer_id,
  coalesce(sum(case when o.status = 'paid' then o.total_cents else 0 end), 0) as gross_revenue_cents,
  coalesce(sum(case when o.status = 'paid' then o.platform_fee_cents else 0 end), 0) as platform_fees_cents,
  coalesce(sum(case when r.status = 'completed' then r.amount_cents else 0 end), 0) as refunds_cents,
  coalesce(sum(case when p.status in ('requested', 'processing') then p.amount_cents else 0 end), 0) as pending_payouts_cents,
  coalesce(sum(case when p.status = 'completed' then p.amount_cents else 0 end), 0) as completed_payouts_cents,
  coalesce(sum(case when o.status = 'paid' then o.total_cents - o.platform_fee_cents else 0 end), 0)
    - coalesce(sum(case when r.status = 'completed' then r.amount_cents else 0 end), 0) as net_revenue_cents
from public.events e
left join public.ticket_orders o on o.event_id = e.id
left join public.ticket_refunds r on r.event_id = e.id
left join public.payout_requests p on p.organizer_id = e.organizer_id
where public.can_manage_event(e.id)
group by e.id, e.title, e.organizer_id;

create or replace view public.organizer_command_center
with (security_invoker = true)
as
select
  op.id as organizer_id,
  count(distinct e.id) filter (where e.starts_at::date = current_date) as todays_events,
  count(distinct e.id) filter (where e.starts_at > now()) as upcoming_events,
  coalesce(sum(o.total_cents) filter (where o.status = 'paid'), 0) / 100 as ticket_revenue_kes,
  coalesce(round((count(distinct tc.id)::numeric / nullif(count(distinct th.id), 0)) * 100, 2), 0) as checkin_rate,
  count(distinct th.id) as attendee_growth,
  count(distinct cp.id) as community_activity,
  count(distinct et.id) filter (where et.status <> 'done') as pending_tasks,
  count(distinct sa.id) filter (where sa.status in ('submitted', 'negotiating')) as pending_sponsorship_requests,
  count(distinct vb.id) filter (where vb.status in ('requested', 'quoted')) as vendor_requests,
  count(distinct sp.id)::text || ' staff' as staff_status,
  0 as food_orders,
  0 as transport_bookings
from public.organizer_profiles op
left join public.events e on e.organizer_id = op.id
left join public.ticket_orders o on o.event_id = e.id
left join public.ticket_holders th on th.event_id = e.id
left join public.ticket_checkins tc on tc.event_id = e.id
left join public.event_communities ec on ec.event_id = e.id
left join public.community_channels cc on cc.community_id = ec.id
left join public.community_posts cp on cp.channel_id = cc.id
left join public.event_tasks et on et.event_id = e.id
left join public.sponsor_applications sa on sa.event_id = e.id
left join public.vendor_bookings vb on vb.event_id = e.id
left join public.staff_profiles sp on sp.assigned_organizer_id = op.id
where public.can_manage_organizer(op.id)
group by op.id;

create or replace view public.sponsor_event_matches
with (security_invoker = true)
as
select
  s.id as sponsor_id,
  e.id as event_id,
  e.title,
  e.city,
  e.category_id,
  (
    case when e.city = any(s.locations) then 20 else 0 end
    + case when ec.name = any(s.industries) then 25 else 0 end
    + least(coalesce(e.capacity_total, 0), 10000) / 100
  ) as match_score
from public.sponsors s
cross join public.events e
left join public.event_categories ec on ec.id = e.category_id
where e.status = 'published'
  and (s.profile_id = (select auth.uid()) or public.can_manage_event(e.id));

alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.event_comments;
alter publication supabase_realtime add table public.event_comment_likes;
alter publication supabase_realtime add table public.event_likes;
alter publication supabase_realtime add table public.event_interests;
alter publication supabase_realtime add table public.saved_events;
alter publication supabase_realtime add table public.event_attendees;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.organizer_followers;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.event_communities;
alter publication supabase_realtime add table public.community_channels;
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_comments;
alter publication supabase_realtime add table public.reels;
alter publication supabase_realtime add table public.reel_likes;
alter publication supabase_realtime add table public.reel_comments;
alter publication supabase_realtime add table public.ticket_types;
alter publication supabase_realtime add table public.ticket_orders;
alter publication supabase_realtime add table public.ticket_payments;
alter publication supabase_realtime add table public.ticket_holders;
alter publication supabase_realtime add table public.ticket_wallet;
alter publication supabase_realtime add table public.ticket_transfers;
alter publication supabase_realtime add table public.ticket_refunds;
alter publication supabase_realtime add table public.ticket_checkins;
alter publication supabase_realtime add table public.event_capacity;
alter publication supabase_realtime add table public.waitlists;
alter publication supabase_realtime add table public.payout_requests;
alter publication supabase_realtime add table public.event_tasks;
alter publication supabase_realtime add table public.event_task_comments;
alter publication supabase_realtime add table public.event_budgets;
alter publication supabase_realtime add table public.event_expenses;
alter publication supabase_realtime add table public.event_finances;
alter publication supabase_realtime add table public.sponsors;
alter publication supabase_realtime add table public.sponsor_applications;
alter publication supabase_realtime add table public.sponsorship_contracts;
alter publication supabase_realtime add table public.vendor_bookings;
alter publication supabase_realtime add table public.vendor_reviews;
alter publication supabase_realtime add table public.organizer_teams;
alter publication supabase_realtime add table public.organizer_permissions;
alter publication supabase_realtime add table public.event_documents;
alter publication supabase_realtime add table public.ai_generated_content;
alter publication supabase_realtime add table public.event_analytics;
alter publication supabase_realtime add table public.event_workspaces;
alter publication supabase_realtime add table public.workspace_channels;
alter publication supabase_realtime add table public.workspace_messages;
alter publication supabase_realtime add table public.workspace_files;
alter publication supabase_realtime add table public.workspace_message_reactions;
alter publication supabase_realtime add table public.workspace_read_receipts;
alter publication supabase_realtime add table public.workspace_typing_indicators;
alter publication supabase_realtime add table public.workspace_meetings;
alter publication supabase_realtime add table public.workspace_meeting_attendance;
alter publication supabase_realtime add table public.staff_assignments;
alter publication supabase_realtime add table public.volunteer_profiles;
alter publication supabase_realtime add table public.volunteer_applications;
alter publication supabase_realtime add table public.staff_shifts;
alter publication supabase_realtime add table public.attendance_logs;
alter publication supabase_realtime add table public.gps_attendance;
alter publication supabase_realtime add table public.performance_reviews;
alter publication supabase_realtime add table public.incident_reports;
alter publication supabase_realtime add table public.emergency_alerts;
alter publication supabase_realtime add table public.event_certificates;
alter publication supabase_realtime add table public.event_announcements;
alter publication supabase_realtime add table public.organization_hierarchy;
alter publication supabase_realtime add table public.approval_workflows;
