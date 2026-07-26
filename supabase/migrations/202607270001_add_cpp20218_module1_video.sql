alter table public.course_assignment_resources
drop constraint if exists course_assignment_resources_kind_check;

alter table public.course_assignment_resources
add constraint course_assignment_resources_kind_check
check (kind in ('video', 'slides', 'learning_resource', 'assessment', 'assessor_key'));

insert into public.course_assignment_resources (
  course_slug,
  assignment_key,
  resource_key,
  audience,
  kind,
  title,
  description,
  original_bucket,
  original_path,
  original_mime_type,
  downloadable,
  position
)
values (
  'certificate-ii-security-operations',
  'assignment-1',
  'module-1-video',
  'student',
  'video',
  'HLTAID011 Provide First Aid — Module 1: Emergency Response Essentials',
  'This video supports—but does not replace—supervised practical training and competency assessment. HLTAID011 practical skills, including adult and infant CPR and AED use, must be demonstrated under assessment conditions.',
  'course-resources',
  null,
  'video/mp4',
  false,
  0
)
on conflict (course_slug, assignment_key, resource_key)
do update set
  audience = excluded.audience,
  kind = excluded.kind,
  title = excluded.title,
  description = excluded.description,
  original_bucket = excluded.original_bucket,
  original_mime_type = excluded.original_mime_type,
  downloadable = excluded.downloadable,
  position = excluded.position,
  updated_at = now();
