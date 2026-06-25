alter table public.courses
add column if not exists code text default 'SSTA',
add column if not exists category text default 'Other',
add column if not exists label text default 'Course',
add column if not exists enrolment_fee integer,
add column if not exists overview text,
add column if not exists external_video_url text,
add column if not exists delivery_modes jsonb not null default '[]'::jsonb,
add column if not exists entry_requirements jsonb not null default '[]'::jsonb,
add column if not exists career_outcomes jsonb not null default '[]'::jsonb,
add column if not exists unit_summary text default '',
add column if not exists availability text default 'open'
  check (availability in ('open', 'coming-soon', 'details-to-follow')),
add column if not exists price_label text,
add column if not exists status_note text,
add column if not exists detail_variant text default 'standard'
  check (detail_variant in ('standard', 'contact-first')),
add column if not exists external_access_url text,
add column if not exists external_access_label text,
add column if not exists duration_details text,
add column if not exists fee_details text,
add column if not exists delivery_strategy text,
add column if not exists source_archive_url text;

update public.courses
set
  code = coalesce(code, 'SSTA'),
  category = coalesce(category, 'Other'),
  label = coalesce(label, 'Course'),
  overview = coalesce(overview, description),
  unit_summary = coalesce(unit_summary, ''),
  availability = coalesce(availability, 'open'),
  detail_variant = coalesce(detail_variant, 'standard');

alter table public.student_profiles
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists phone text;

create table if not exists public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.courses(slug) on delete cascade,
  code text not null,
  title text not null,
  type text not null default 'Skill set' check (type in ('Core', 'Elective', 'Skill set')),
  prerequisite text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, code)
);

drop trigger if exists set_course_units_updated_at on public.course_units;
create trigger set_course_units_updated_at
before update on public.course_units
for each row execute function public.set_updated_at();

create index if not exists idx_courses_category_active
on public.courses (category, is_active);

create index if not exists idx_course_units_course_position
on public.course_units (course_slug, position);

alter table public.course_units enable row level security;

drop policy if exists "Public can read course units" on public.course_units;
create policy "Public can read course units"
on public.course_units
for select
using (
  exists (
    select 1 from public.courses
    where public.courses.slug = public.course_units.course_slug
    and public.courses.is_active = true
  )
);
