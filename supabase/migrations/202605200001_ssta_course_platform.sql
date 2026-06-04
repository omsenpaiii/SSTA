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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_student_profiles_updated_at on public.student_profiles;
create trigger set_student_profiles_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_course_lessons_updated_at on public.course_lessons;
create trigger set_course_lessons_updated_at
before update on public.course_lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_enrollment_leads_updated_at on public.enrollment_leads;
create trigger set_enrollment_leads_updated_at
before update on public.enrollment_leads
for each row execute function public.set_updated_at();

drop trigger if exists set_course_enrollments_updated_at on public.course_enrollments;
create trigger set_course_enrollments_updated_at
before update on public.course_enrollments
for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

create index if not exists idx_course_lessons_course_position
on public.course_lessons (course_slug, position);

create index if not exists idx_enrollment_leads_course_status
on public.enrollment_leads (course_slug, payment_status);

create index if not exists idx_enrollment_leads_email_created
on public.enrollment_leads (email, created_at desc);

create index if not exists idx_course_enrollments_clerk_status
on public.course_enrollments (clerk_user_id, status);

create index if not exists idx_lesson_progress_clerk_course
on public.lesson_progress (clerk_user_id, course_slug);

alter table public.student_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.enrollment_leads enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "Public can read active courses" on public.courses;
create policy "Public can read active courses"
on public.courses
for select
using (is_active = true);

drop policy if exists "Public can read preview lessons" on public.course_lessons;
create policy "Public can read preview lessons"
on public.course_lessons
for select
using (is_preview = true);

drop policy if exists "Students can read their profile" on public.student_profiles;
create policy "Students can read their profile"
on public.student_profiles
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

drop policy if exists "Students can read their enrollments" on public.course_enrollments;
create policy "Students can read their enrollments"
on public.course_enrollments
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

drop policy if exists "Students can read their lesson progress" on public.lesson_progress;
create policy "Students can read their lesson progress"
on public.lesson_progress
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

drop policy if exists "Students can update their lesson progress" on public.lesson_progress;
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
    'The core SSTA pathway for unarmed guard and crowd controller licensing outcomes.',
    1195,
    '291 nominal hours',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'certificate-iii-security-operations-armed-cash-in-transit',
    'Certificate III Security Operations',
    'For licensed officers who want to deepen operational skills and lead teams in specialist security settings.',
    2840,
    '228 nominal hours',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'batons-and-handcuffs-skill-set',
    'Batons & Handcuffs Skill Set',
    'A practical extension for licensed officers who need baton and handcuff capability for approved work roles.',
    450,
    '1 day',
    'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'certificate-iv-security-management',
    'Certificate IV Security Management',
    'For supervisors and security business managers coordinating operational teams and client services.',
    2650,
    '12 months full-time',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'provide-first-aid',
    'Provide First Aid',
    'First aid response, life support, casualty management and incident support until assistance arrives.',
    165,
    '1 day',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80'
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
  ('certificate-ii-security-operations', 'security-preview', 'Security operations orientation', '04:28', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 1, true),
  ('certificate-ii-security-operations', 'legal-procedures', 'Legal and procedural requirements', '12:40', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 2, false),
  ('certificate-ii-security-operations', 'risk-response', 'Risk assessment and response', '16:05', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 3, false),
  ('certificate-ii-security-operations', 'crowd-behaviour', 'Monitor crowd behaviour', '14:12', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 4, false),
  ('certificate-iii-security-operations-armed-cash-in-transit', 'advanced-preview', 'Advanced security pathway overview', '05:10', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 1, true),
  ('certificate-iii-security-operations-armed-cash-in-transit', 'operational-safety', 'Operational safety and risk control', '13:35', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 2, false),
  ('batons-and-handcuffs-skill-set', 'baton-preview', 'Baton and handcuff safety overview', '03:45', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 1, true),
  ('batons-and-handcuffs-skill-set', 'lawful-use', 'Lawful use and workplace authorisation', '11:20', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 2, false),
  ('certificate-iv-security-management', 'management-preview', 'Security management overview', '04:55', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 1, true),
  ('certificate-iv-security-management', 'client-needs', 'Assess client security needs', '12:10', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 2, false),
  ('provide-first-aid', 'first-aid-preview', 'First aid course orientation', '03:20', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', 1, true)
on conflict (course_slug, lesson_key) do update set
  title = excluded.title,
  duration = excluded.duration,
  video_provider = excluded.video_provider,
  video_url = excluded.video_url,
  position = excluded.position,
  is_preview = excluded.is_preview,
  updated_at = now();
