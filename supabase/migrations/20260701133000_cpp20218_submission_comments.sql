alter table public.assignment_submissions
add column if not exists student_comment text,
add column if not exists resubmission_count integer not null default 0;

update public.course_assignments
set title = replace(title, 'Assignment', 'Cluster'),
    updated_at = now()
where course_slug = 'certificate-ii-security-operations'
  and title like 'Assignment%';
