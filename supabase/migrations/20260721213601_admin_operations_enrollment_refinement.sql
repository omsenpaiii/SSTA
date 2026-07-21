alter table public.student_profiles
  add column if not exists date_of_birth date,
  add column if not exists usi text,
  add column if not exists residential_address text,
  add column if not exists disability_status text,
  add column if not exists disability_details text,
  add column if not exists origin text not null default 'admin',
  add column if not exists referred_by text;

update public.student_profiles
set usi = upper(nullif(btrim(usi), ''))
where usi is not null;

alter table public.student_profiles
  drop constraint if exists student_profiles_usi_format_check,
  add constraint student_profiles_usi_format_check
    check (usi is null or usi ~ '^[A-Z0-9]{10}$'),
  drop constraint if exists student_profiles_disability_status_check,
  add constraint student_profiles_disability_status_check
    check (disability_status is null or disability_status in ('no', 'yes', 'prefer_not_to_say')),
  drop constraint if exists student_profiles_origin_check,
  add constraint student_profiles_origin_check
    check (origin in ('admin', 'import', 'self_enrolled'));

create unique index if not exists student_profiles_usi_unique
  on public.student_profiles (upper(usi))
  where usi is not null and btrim(usi) <> '';

create index if not exists student_profiles_origin_idx
  on public.student_profiles (origin)
  where archived_at is null;

alter table public.enrollment_leads
  add column if not exists origin text not null default 'self_enrolled',
  add column if not exists referred_by text;

alter table public.interest_leads
  add column if not exists origin text not null default 'self_enrolled',
  add column if not exists referred_by text;

alter table public.enrollment_leads
  drop constraint if exists enrollment_leads_origin_check,
  add constraint enrollment_leads_origin_check
    check (origin in ('admin', 'import', 'self_enrolled'));

alter table public.interest_leads
  drop constraint if exists interest_leads_origin_check,
  add constraint interest_leads_origin_check
    check (origin in ('admin', 'import', 'self_enrolled'));

alter table public.courses
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_email text;

create index if not exists courses_active_title_idx
  on public.courses (is_active, title);

create table if not exists public.admin_notification_reads (
  admin_email text not null,
  event_key text not null,
  read_at timestamptz not null default now(),
  primary key (admin_email, event_key)
);

alter table public.admin_notification_reads enable row level security;

comment on table public.admin_notification_reads is
  'Server-managed read receipts for derived admin operational notifications.';
