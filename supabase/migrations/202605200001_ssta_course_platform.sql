create extension if not exists pgcrypto;

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  slug text primary key,
  title text not null,
  description text not null,
  price_aud integer not null default 100,
  duration text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.courses(slug) on delete cascade,
  lesson_key text not null,
  title text not null,
  duration text,
  video_provider text not null check (video_provider in ('youtube', 'google-drive')),
  video_url text not null,
  position integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, lesson_key)
);

create table if not exists public.enrollment_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  date_of_birth date not null,
  usi text not null,
  address text not null,
  course_slug text not null references public.courses(slug) on delete restrict,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'cancelled')),
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references public.student_profiles(clerk_user_id) on delete cascade,
  course_slug text not null references public.courses(slug) on delete cascade,
  status text not null default 'active' check (status in ('active', 'refunded', 'revoked')),
  stripe_customer_id text,
  stripe_session_id text,
  amount_paid integer,
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, course_slug),
  unique (stripe_session_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references public.student_profiles(clerk_user_id) on delete cascade,
  course_slug text not null references public.courses(slug) on delete cascade,
  lesson_id text not null,
  progress_seconds integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, course_slug, lesson_id)
);

alter table public.student_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.enrollment_leads enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Public can read active courses"
on public.courses
for select
using (is_active = true);

create policy "Public can read preview lessons"
on public.course_lessons
for select
using (is_preview = true);

create policy "Students can read their profile"
on public.student_profiles
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

create policy "Students can read their enrollments"
on public.course_enrollments
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

create policy "Students can read their lesson progress"
on public.lesson_progress
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

create policy "Students can update their lesson progress"
on public.lesson_progress
for all
using ((auth.jwt() ->> 'sub') = clerk_user_id)
with check ((auth.jwt() ->> 'sub') = clerk_user_id);

insert into public.courses (slug, title, description, price_aud, duration, image_url)
values
  (
    'certificate-ii-security-operations',
    'Certificate II Security Operations',
    'Foundational security training with practical procedures, responsibilities, and compliance-led video lessons.',
    100,
    '8 modules',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'crowd-control-essentials',
    'Crowd Control Essentials',
    'Entry screening, communication, conflict prevention, safe escalation, and clear incident reporting.',
    100,
    '6 modules',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'patrol-risk-awareness',
    'Patrol & Risk Awareness',
    'Scenario-led patrol checks, hazard awareness, observation routines, and professional handovers.',
    100,
    '5 modules',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80'
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  price_aud = excluded.price_aud,
  duration = excluded.duration,
  image_url = excluded.image_url,
  updated_at = now();

insert into public.course_lessons (
  course_slug,
  lesson_key,
  title,
  duration,
  video_provider,
  video_url,
  position,
  is_preview
)
values
  ('certificate-ii-security-operations', 'welcome', 'Welcome to SSTA training', '04:28', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 1, true),
  ('certificate-ii-security-operations', 'legal-responsibilities', 'Legal responsibilities and duty of care', '12:40', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 2, false),
  ('certificate-ii-security-operations', 'incident-reports', 'Observation, notes, and incident reports', '16:05', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 3, false),
  ('certificate-ii-security-operations', 'communication-pressure', 'Communication under pressure', '14:12', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 4, false)
on conflict (course_slug, lesson_key) do update set
  title = excluded.title,
  duration = excluded.duration,
  video_provider = excluded.video_provider,
  video_url = excluded.video_url,
  position = excluded.position,
  is_preview = excluded.is_preview,
  updated_at = now();
