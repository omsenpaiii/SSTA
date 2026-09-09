-- Public enrollment documents remain private; only server-side endpoints serve them.
alter table public.enrollment_leads
  alter column date_of_birth drop not null,
  add column if not exists document_path text,
  add column if not exists document_name text,
  add column if not exists security_guest_key text,
  add column if not exists security_user_key text;
create index if not exists enrollment_security_guest_idx on public.enrollment_leads(security_guest_key);
create index if not exists enrollment_security_user_idx on public.enrollment_leads(security_user_key);
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('security-enrollments', 'security-enrollments', false, 4194304,
  array['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- LLN grades must only be written by the trusted server grader.
drop policy if exists "Students can insert their LLN attempts" on public.lln_attempts;
revoke insert, update, delete on public.lln_attempts from anon, authenticated;

alter table public.payment_intents add column if not exists fulfilled_at timestamptz;
alter table public.payment_intents add column if not exists admin_notified_at timestamptz;

-- Atomic, idempotent Cluster 1 fulfillment. A webhook retry cannot undo a later admin lock.
create or replace function public.fulfill_security_cluster_one(p_intent_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare intent public.payment_intents%rowtype;
begin
  select * into intent from public.payment_intents where id = p_intent_id for update;
  if not found or intent.status <> 'paid' or intent.course_slug <> 'certificate-ii-security-operations'
    or intent.purpose <> 'assignment_unlock' or intent.assignment_key <> 'assignment-1'
    or intent.amount_cents <> 15000 or lower(intent.currency) <> 'aud' then
    raise exception 'Invalid Cluster 1 payment';
  end if;
  if intent.fulfilled_at is not null then return; end if;
  if not exists (select 1 from public.course_enrollments where user_key = intent.user_key
      and course_slug = intent.course_slug and status = 'active') then
    raise exception 'Course enrollment is not active';
  end if;
  insert into public.student_assignment_access(user_key, course_slug, assignment_key, unlocked, reason)
    values(intent.user_key, intent.course_slug, 'assignment-1', true, 'Cluster 1 payment confirmed')
    on conflict(user_key, course_slug, assignment_key) do update set unlocked = true, reason = excluded.reason;
  update public.course_enrollments set amount_paid = coalesce(amount_paid,0) + intent.amount_cents,
    currency = 'AUD', updated_at = now() where user_key = intent.user_key and course_slug = intent.course_slug;
  update public.payment_intents set fulfilled_at = now() where id = p_intent_id;
end;
$$;
revoke all on function public.fulfill_security_cluster_one(uuid) from public, anon, authenticated;
grant execute on function public.fulfill_security_cluster_one(uuid) to service_role;

update public.courses set enrolment_fee = 0,
  fee_details = 'Enrollment form and LLN: free. Pay AUD $150 to start Cluster 1. SSTA manages later clusters.', updated_at = now()
where slug = 'certificate-ii-security-operations';
