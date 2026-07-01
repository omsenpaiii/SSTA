with student as (
  select
    coalesce(
      (
        select user_key
        from public.student_profiles
        where lower(email) = 'omtomar4882@gmail.com'
        order by case when user_key like 'manual:%' then 1 else 0 end
        limit 1
      ),
      'manual:omtomar4882@gmail.com'
    ) as user_key,
    'Om'::text as first_name,
    'Tomar'::text as last_name,
    'omtomar4882@gmail.com'::text as email,
    'Abu'::text as source
),
upserted_profile as (
  insert into public.student_profiles (user_key, first_name, last_name, email, updated_at)
  select user_key, first_name, last_name, email, now()
  from student
  on conflict (user_key) do update
  set first_name = coalesce(public.student_profiles.first_name, excluded.first_name),
      last_name = coalesce(public.student_profiles.last_name, excluded.last_name),
      email = excluded.email,
      updated_at = now()
  returning user_key
),
upserted_enrollment as (
  insert into public.course_enrollments (user_key, course_slug, status, source, source_note, updated_at)
  select
    user_key,
    'certificate-ii-security-operations',
    'active',
    source,
    'CPP20218 Abu reference student import - July 2026',
    now()
  from student
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
  case when a.assignment_key = 'assignment-1' then true else false end,
  e.source,
  case
    when a.assignment_key = 'assignment-1'
      then 'Initial Assignment 1 access for non-SSTA/Clint source'
    else 'Locked pending payment gateway setup'
  end,
  now()
from upserted_enrollment e
cross join public.course_assignments a
where a.course_slug = 'certificate-ii-security-operations'
on conflict (user_key, course_slug, assignment_key) do update
set source = excluded.source,
    reason = excluded.reason,
    unlocked = excluded.unlocked,
    updated_at = now();
