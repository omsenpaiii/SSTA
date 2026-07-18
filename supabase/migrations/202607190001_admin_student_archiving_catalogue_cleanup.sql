alter table public.student_profiles
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_email text;

create index if not exists idx_student_profiles_archive_name
on public.student_profiles (
  archived_at,
  lower(coalesce(first_name, '')),
  lower(coalesce(last_name, '')),
  lower(coalesce(email, ''))
);

update public.courses
set is_active = false,
    updated_at = now()
where slug in ('patrol-risk-awareness', 'crowd-control-essentials');
