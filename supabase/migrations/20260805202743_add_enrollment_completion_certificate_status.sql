alter table public.course_enrollments
  drop constraint if exists course_enrollments_status_check,
  add constraint course_enrollments_status_check
    check (status in ('active', 'completed', 'refunded', 'revoked', 'archived')),
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by_email text,
  add column if not exists certificate_status text not null default 'not_ready';

alter table public.course_enrollments
  drop constraint if exists course_enrollments_certificate_status_check,
  add constraint course_enrollments_certificate_status_check
    check (certificate_status in ('not_ready', 'ready_for_collection', 'collected'));

create index if not exists course_enrollments_completion_idx
  on public.course_enrollments (status, completed_at desc)
  where status = 'completed';

comment on column public.course_enrollments.certificate_status is
  'Certificate handover state for a completed course enrolment.';
