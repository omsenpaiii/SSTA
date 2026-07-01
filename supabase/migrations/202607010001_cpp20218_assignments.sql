alter table public.course_enrollments
add column if not exists source text,
add column if not exists source_note text;

create table if not exists public.course_assignments (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.courses(slug) on delete cascade,
  assignment_key text not null,
  title text not null,
  subtitle text not null default '',
  overview text not null default '',
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, assignment_key)
);

create table if not exists public.course_assignment_resources (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  assignment_key text not null,
  resource_key text not null,
  audience text not null check (audience in ('student', 'admin')),
  kind text not null check (kind in ('slides', 'learning_resource', 'assessment', 'assessor_key')),
  title text not null,
  description text not null default '',
  original_bucket text not null default 'course-resources',
  original_path text,
  original_mime_type text,
  preview_bucket text not null default 'course-resources',
  preview_path text,
  preview_mime_type text,
  downloadable boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, assignment_key, resource_key),
  foreign key (course_slug, assignment_key)
    references public.course_assignments(course_slug, assignment_key)
    on delete cascade
);

create table if not exists public.student_assignment_access (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.student_profiles(user_key) on delete cascade,
  course_slug text not null,
  assignment_key text not null,
  unlocked boolean not null default false,
  source text,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_key, course_slug, assignment_key),
  foreign key (course_slug, assignment_key)
    references public.course_assignments(course_slug, assignment_key)
    on delete cascade
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.student_profiles(user_key) on delete cascade,
  course_slug text not null,
  assignment_key text not null,
  file_bucket text not null default 'student-submissions',
  file_path text not null,
  file_name text not null,
  mime_type text,
  file_size bigint,
  status text not null default 'submitted'
    check (status in ('submitted', 'satisfactory', 'not_satisfactory')),
  admin_comment text,
  reviewed_by text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_key, course_slug, assignment_key),
  foreign key (course_slug, assignment_key)
    references public.course_assignments(course_slug, assignment_key)
    on delete cascade
);

drop trigger if exists set_course_assignments_updated_at on public.course_assignments;
create trigger set_course_assignments_updated_at
before update on public.course_assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_course_assignment_resources_updated_at on public.course_assignment_resources;
create trigger set_course_assignment_resources_updated_at
before update on public.course_assignment_resources
for each row execute function public.set_updated_at();

drop trigger if exists set_student_assignment_access_updated_at on public.student_assignment_access;
create trigger set_student_assignment_access_updated_at
before update on public.student_assignment_access
for each row execute function public.set_updated_at();

drop trigger if exists set_assignment_submissions_updated_at on public.assignment_submissions;
create trigger set_assignment_submissions_updated_at
before update on public.assignment_submissions
for each row execute function public.set_updated_at();

create index if not exists idx_course_assignments_course_position
on public.course_assignments (course_slug, position);

create index if not exists idx_assignment_resources_course_assignment
on public.course_assignment_resources (course_slug, assignment_key, audience, position);

create index if not exists idx_student_assignment_access_user_course
on public.student_assignment_access (user_key, course_slug, unlocked);

create index if not exists idx_assignment_submissions_course_assignment_status
on public.assignment_submissions (course_slug, assignment_key, status);

alter table public.course_assignments enable row level security;
alter table public.course_assignment_resources enable row level security;
alter table public.student_assignment_access enable row level security;
alter table public.assignment_submissions enable row level security;

drop policy if exists "Students can read enrolled course assignments" on public.course_assignments;
create policy "Students can read enrolled course assignments"
on public.course_assignments
for select
to authenticated
using (
  exists (
    select 1
    from public.course_enrollments ce
    where ce.course_slug = course_assignments.course_slug
      and ce.user_key = (select auth.uid())::text
      and ce.status = 'active'
  )
);

drop policy if exists "Students can read their assignment access" on public.student_assignment_access;
create policy "Students can read their assignment access"
on public.student_assignment_access
for select
to authenticated
using ((select auth.uid())::text = user_key);

drop policy if exists "Students can read their submissions" on public.assignment_submissions;
create policy "Students can read their submissions"
on public.assignment_submissions
for select
to authenticated
using ((select auth.uid())::text = user_key);

drop policy if exists "Students can insert their submissions" on public.assignment_submissions;
create policy "Students can insert their submissions"
on public.assignment_submissions
for insert
to authenticated
with check ((select auth.uid())::text = user_key);

drop policy if exists "Students can update their submissions" on public.assignment_submissions;
create policy "Students can update their submissions"
on public.assignment_submissions
for update
to authenticated
using ((select auth.uid())::text = user_key)
with check ((select auth.uid())::text = user_key);

grant select on public.course_assignments to authenticated;
grant select on public.course_assignment_resources to authenticated;
grant select on public.student_assignment_access to authenticated;
grant select, insert, update on public.assignment_submissions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-resources', 'course-resources', false, 1200000000, null),
  ('student-submissions', 'student-submissions', false, 52428800, null)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.course_assignments
  (course_slug, assignment_key, title, subtitle, overview, position)
values
  ('certificate-ii-security-operations', 'assignment-1', 'Assignment 1', 'HLTAID011 Provide First Aid', 'First aid learner resources and assessment workbook.', 1),
  ('certificate-ii-security-operations', 'assignment-2', 'Assignment 2', 'Law & Client Services', 'Legal, client service, and procedural learning activities.', 2),
  ('certificate-ii-security-operations', 'assignment-3', 'Assignment 3', 'Assess Risk and Maintain Safety', 'Risk, safety, incident, and practical assessment activities.', 3),
  ('certificate-ii-security-operations', 'assignment-4', 'Assignment 4', 'Security Operations', 'Security guarding operations learner resources and assessment.', 4),
  ('certificate-ii-security-operations', 'assignment-5', 'Assignment 5', 'Operational Safety', 'Operational safety learner resources and assessment.', 5),
  ('certificate-ii-security-operations', 'assignment-6', 'Assignment 6', 'Final Law Gap', 'Final law gap workbook and assessor guide.', 6)
on conflict (course_slug, assignment_key) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    overview = excluded.overview,
    position = excluded.position,
    is_active = true,
    updated_at = now();

with students(source, first_name, last_name, phone, email) as (
  values
    ('Sal', 'Alan', 'Rosborough', '0407349331', 'rossies06@outlook.com'),
    ('Abu', 'Harjaspreet', 'Singh', '0411645985', 'harjaspreetsinghsomal@gmail.com'),
    ('SSTA', 'Ahmad', null, '0450101622', 'salehsetare27@yahoo.com'),
    ('Abu', 'Amandeep Singh', 'Padam', '0475777446', 'adspadam@gmail.com'),
    ('Abu', 'Anaf Bhuaiyan', 'Seam', '0483878645', 'anafbhuaiyan@gmail.com'),
    ('SSTA', 'Bianca', null, '0413069897', 'biancanahirnyi@gmail.com'),
    ('SSTA', 'Bill', 'Smith', '0447627296', 'manager@randseco.com'),
    ('Abu', 'Dyaa Awdish', 'Benyamen', '0411596217', 'dyaaben@vahoo.com'),
    ('SSTA', 'Elroy', 'Deseusa', '0430825769', 'alroyd@gmail.com'),
    ('SSTA', 'Gabriel', null, '0486041456', 'gabareel.g@gmail.com'),
    ('Abu', 'Haitham layth', 'Francis', '0413067880', 'haithamsese3@gmail.com'),
    ('SSTA', 'Ian', 'Frost', '0425760044', 'ianf2009@live.com'),
    ('SSTA', 'Jamal', 'El Masri', '0449802442', 'janadakitchens@yahoo.com'),
    ('Abu', 'Laith Riyadh Jibrael', 'Butto', '0493264665', 'laith.reyad5@gmail.com'),
    ('Abu', 'Md Badrul', 'Alam', '0480252213', 'shohan500@yahoo.com'),
    ('SSTA', 'Patel', 'Shlini', '0426461566', 'patelshalini990@gmail.com'),
    ('SSTA', 'Udit', null, '0421221456', '47udit@gmail.com'),
    ('Abu', 'Wanni', 'ZHU', '0412036985', 'wanni.zhu@cgliveproductions.com.au'),
    ('Abu', 'Yousif', 'Gahreeb', '0487925651', 'yousifosama5@gmail.com'),
    ('Abu', 'Zakaria', 'Chowdhury', '0480622817', 'zakcho@gmail.com'),
    ('Abu', 'Antoun', 'Sandaklie', '0451140374', 'asandaklie@gmail.com')
),
upserted_profiles as (
  insert into public.student_profiles (user_key, first_name, last_name, phone, email, updated_at)
  select
    'manual:' || lower(email),
    first_name,
    last_name,
    phone,
    lower(email),
    now()
  from students
  on conflict (user_key) do update
  set first_name = coalesce(excluded.first_name, public.student_profiles.first_name),
      last_name = coalesce(excluded.last_name, public.student_profiles.last_name),
      phone = coalesce(excluded.phone, public.student_profiles.phone),
      email = excluded.email,
      updated_at = now()
  returning user_key, email
),
upserted_enrollments as (
  insert into public.course_enrollments (user_key, course_slug, status, source, source_note, updated_at)
  select
    'manual:' || lower(email),
    'certificate-ii-security-operations',
    'active',
    source,
    'CPP20218 June 2026 batch import',
    now()
  from students
  on conflict (user_key, course_slug) do update
  set status = 'active',
      source = excluded.source,
      source_note = excluded.source_note,
      updated_at = now()
  returning user_key, source
)
insert into public.student_assignment_access
  (user_key, course_slug, assignment_key, unlocked, source, reason, updated_at)
select
  e.user_key,
  a.course_slug,
  a.assignment_key,
  case
    when lower(e.source) not in ('ssta', 'clint') and a.assignment_key = 'assignment-1'
      then true
    else false
  end,
  e.source,
  case
    when lower(e.source) not in ('ssta', 'clint') and a.assignment_key = 'assignment-1'
      then 'Initial Assignment 1 access for non-SSTA/Clint source'
    else 'Locked pending payment gateway setup'
  end,
  now()
from upserted_enrollments e
cross join public.course_assignments a
where a.course_slug = 'certificate-ii-security-operations'
on conflict (user_key, course_slug, assignment_key) do update
set source = excluded.source,
    reason = excluded.reason,
    unlocked = excluded.unlocked,
    updated_at = now();
