alter table public.enrollment_leads
  add column if not exists payment_provider text default 'stripe',
  add column if not exists payment_session_id text,
  add column if not exists provider_payment_id text;

alter table public.course_enrollments
  add column if not exists payment_provider text default 'stripe',
  add column if not exists payment_session_id text,
  add column if not exists provider_payment_id text;

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'pinch',
  purpose text not null check (purpose in ('course_enrollment', 'assignment_unlock')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  user_key text not null,
  email text,
  course_slug text not null,
  assignment_key text,
  enrollment_id uuid references public.enrollment_leads(id) on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'AUD',
  provider_payer_id text,
  provider_payment_link_id text,
  provider_payment_id text,
  provider_status text,
  checkout_url text,
  metadata jsonb,
  raw_event jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_intents_provider_payment_link_id_key
on public.payment_intents (provider, provider_payment_link_id)
where provider_payment_link_id is not null;

create index if not exists idx_payment_intents_user_course
on public.payment_intents (user_key, course_slug, created_at desc);

create index if not exists idx_payment_intents_provider_payment_id
on public.payment_intents (provider, provider_payment_id)
where provider_payment_id is not null;

drop trigger if exists set_payment_intents_updated_at on public.payment_intents;
create trigger set_payment_intents_updated_at
before update on public.payment_intents
for each row execute function public.set_updated_at();

alter table public.payment_intents enable row level security;

drop policy if exists "Students can read their payment intents" on public.payment_intents;
create policy "Students can read their payment intents"
on public.payment_intents
for select
using (auth.uid()::text = user_key);
