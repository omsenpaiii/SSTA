alter table public.courses
  alter column enrolment_fee set default 150;

update public.courses
set enrolment_fee = 150,
    updated_at = now()
where is_active = true;

alter table public.enrollment_leads
  alter column date_of_birth drop not null,
  alter column usi drop not null,
  alter column address drop not null;

create table if not exists public.enrollment_applications (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  enrollment_id uuid references public.enrollment_leads(id) on delete set null,
  course_slug text not null references public.courses(slug) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'changes_requested', 'approved')),
  application_data jsonb not null default '{}'::jsonb,
  student_declaration boolean not null default false,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_email text,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_key, course_slug)
);

create index if not exists enrollment_applications_status_idx
  on public.enrollment_applications (status, submitted_at desc);

drop trigger if exists set_enrollment_applications_updated_at on public.enrollment_applications;
create trigger set_enrollment_applications_updated_at
before update on public.enrollment_applications
for each row execute function public.set_updated_at();

alter table public.enrollment_applications enable row level security;

revoke all on table public.enrollment_applications from anon;
grant select, insert, update on table public.enrollment_applications to authenticated;

drop policy if exists "Students can read their enrolment applications" on public.enrollment_applications;
create policy "Students can read their enrolment applications"
on public.enrollment_applications for select
to authenticated
using ((select auth.uid())::text = user_key);

drop policy if exists "Students can create their enrolment applications" on public.enrollment_applications;
create policy "Students can create their enrolment applications"
on public.enrollment_applications for insert
to authenticated
with check ((select auth.uid())::text = user_key);

drop policy if exists "Students can update editable enrolment applications" on public.enrollment_applications;
create policy "Students can update editable enrolment applications"
on public.enrollment_applications for update
to authenticated
using ((select auth.uid())::text = user_key and status in ('draft', 'changes_requested'))
with check ((select auth.uid())::text = user_key and status in ('draft', 'submitted', 'changes_requested'));

comment on table public.enrollment_applications is
  'Full student enrolment applications completed after the compulsory initial payment.';
