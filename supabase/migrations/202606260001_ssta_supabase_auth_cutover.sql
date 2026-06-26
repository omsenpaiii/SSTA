do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_profiles'
      and column_name = 'clerk_user_id'
  ) then
    alter table public.student_profiles rename column clerk_user_id to user_key;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_enrollments'
      and column_name = 'clerk_user_id'
  ) then
    alter table public.course_enrollments rename column clerk_user_id to user_key;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'lesson_progress'
      and column_name = 'clerk_user_id'
  ) then
    alter table public.lesson_progress rename column clerk_user_id to user_key;
  end if;
end
$$;

alter index if exists public.student_profiles_clerk_user_id_key
rename to student_profiles_user_key_key;

alter index if exists public.course_enrollments_clerk_user_id_course_slug_key
rename to course_enrollments_user_key_course_slug_key;

alter index if exists public.lesson_progress_clerk_user_id_course_slug_lesson_id_key
rename to lesson_progress_user_key_course_slug_lesson_id_key;

alter index if exists public.idx_course_enrollments_clerk_status
rename to idx_course_enrollments_user_key_status;

alter index if exists public.idx_lesson_progress_clerk_course
rename to idx_lesson_progress_user_key_course;

drop policy if exists "Students can read their profile" on public.student_profiles;
create policy "Students can read their profile"
on public.student_profiles
for select
to authenticated
using ((select auth.uid())::text = user_key);

drop policy if exists "Students can read their enrollments" on public.course_enrollments;
create policy "Students can read their enrollments"
on public.course_enrollments
for select
to authenticated
using ((select auth.uid())::text = user_key);

drop policy if exists "Students can read their lesson progress" on public.lesson_progress;
create policy "Students can read their lesson progress"
on public.lesson_progress
for select
to authenticated
using ((select auth.uid())::text = user_key);

drop policy if exists "Students can update their lesson progress" on public.lesson_progress;
create policy "Students can update their lesson progress"
on public.lesson_progress
for all
to authenticated
using ((select auth.uid())::text = user_key)
with check ((select auth.uid())::text = user_key);
