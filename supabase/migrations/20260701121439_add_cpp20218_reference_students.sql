with students(source, first_name, last_name, phone, email) as (
  values
    ('Abu', 'Agastya', 'Reference', null, 'tradingwithagastya1@gmail.com'),
    ('Clint', 'Agastya', 'Kapoor', null, 'agastyakapoorgk@gmail.com')
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
    'CPP20218 reference student import - July 2026',
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
