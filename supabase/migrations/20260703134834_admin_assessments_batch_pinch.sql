alter table public.student_profiles
  add column if not exists batch_number integer not null default 2;

update public.student_profiles
set batch_number = 2
where batch_number is null;

alter table public.assignment_submissions
  add column if not exists submitted_by text not null default 'student',
  add column if not exists uploaded_by_admin_email text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assignment_submissions_submitted_by_check'
      and conrelid = 'public.assignment_submissions'::regclass
  ) then
    alter table public.assignment_submissions
      add constraint assignment_submissions_submitted_by_check
      check (submitted_by in ('student', 'admin'))
      not valid;
  end if;
end $$;

alter table public.assignment_submissions
  validate constraint assignment_submissions_submitted_by_check;

create index if not exists idx_student_profiles_batch_number
on public.student_profiles (batch_number);

create index if not exists idx_assignment_submissions_submitted_by
on public.assignment_submissions (submitted_by, updated_at desc);
