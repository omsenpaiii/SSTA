create table if not exists public.lln_attempts (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  email text,
  course_slug text not null,
  test_key text not null,
  score integer not null default 0,
  total integer not null check (total > 0),
  score_percent numeric(5, 2) not null default 0,
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lln_attempts_user_course_created_idx
  on public.lln_attempts (user_key, course_slug, test_key, created_at desc);

create index if not exists lln_attempts_passed_idx
  on public.lln_attempts (user_key, course_slug, test_key)
  where passed = true;

alter table public.lln_attempts enable row level security;

drop policy if exists "Students can read their LLN attempts" on public.lln_attempts;
create policy "Students can read their LLN attempts"
  on public.lln_attempts
  for select
  to authenticated
  using ((select auth.uid())::text = user_key);

drop policy if exists "Students can insert their LLN attempts" on public.lln_attempts;
create policy "Students can insert their LLN attempts"
  on public.lln_attempts
  for insert
  to authenticated
  with check ((select auth.uid())::text = user_key);

alter table public.enrollment_leads
  add column if not exists disability_status text not null default 'no',
  add column if not exists disability_details text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollment_leads_disability_status_check'
      and conrelid = 'public.enrollment_leads'::regclass
  ) then
    alter table public.enrollment_leads
      add constraint enrollment_leads_disability_status_check
      check (disability_status in ('no', 'yes', 'prefer_not_to_say'));
  end if;
end $$;

update public.courses
set
  price_aud = 1295,
  price_label = '$1,295',
  fee_details = 'Tuition Fee: $1,295 Enrolment Fee: $500',
  updated_at = now()
where slug = 'certificate-ii-security-operations';

update public.courses
set
  price_aud = 2390,
  price_label = '$2,390',
  fee_details = 'Tuition Fee: $2,390 Enrolment Fee: $500',
  updated_at = now()
where slug = 'certificate-iii-security-operations-armed-cash-in-transit';

update public.courses
set
  price_aud = 250,
  price_label = '$250',
  fee_details = 'Tuition Fee: $250',
  updated_at = now()
where slug = 'batons-and-handcuffs-skill-set';

update public.courses
set
  code = 'CPC30220',
  price_aud = 13628,
  price_label = '$13,628',
  updated_at = now()
where slug = 'certificate-iii-carpentry';
