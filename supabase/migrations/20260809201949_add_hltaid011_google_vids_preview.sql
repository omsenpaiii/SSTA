alter table public.course_lessons
drop constraint if exists course_lessons_video_provider_check;

alter table public.course_lessons
add constraint course_lessons_video_provider_check
check (video_provider in ('youtube', 'google-drive', 'google-vids'));

alter table public.course_assignment_resources
add column if not exists external_video_provider text,
add column if not exists external_video_url text;

alter table public.course_assignment_resources
drop constraint if exists course_assignment_resources_external_video_provider_check;

alter table public.course_assignment_resources
add constraint course_assignment_resources_external_video_provider_check
check (
  external_video_provider is null
  or external_video_provider in ('youtube', 'google-drive', 'google-vids')
);

update public.course_lessons
set
  title = 'HLTAID011 Provide First Aid — Module 1: Emergency Response Essentials',
  duration = '10:14',
  video_provider = 'google-vids',
  video_url = 'https://docs.google.com/videos/d/1BV_XtyPmiiT9TKKMJjqpJghpOL-WenNIDvLIP509cbo/play',
  position = 0,
  is_preview = true,
  updated_at = now()
where course_slug = 'certificate-ii-security-operations'
  and lesson_key = 'security-preview';

update public.course_assignment_resources
set
  external_video_provider = 'google-vids',
  external_video_url = 'https://docs.google.com/videos/d/1BV_XtyPmiiT9TKKMJjqpJghpOL-WenNIDvLIP509cbo/play',
  updated_at = now()
where course_slug = 'certificate-ii-security-operations'
  and assignment_key = 'assignment-1'
  and resource_key = 'module-1-video';
