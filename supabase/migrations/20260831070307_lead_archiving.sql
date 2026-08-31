alter table public.enrollment_leads
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_email text;

alter table public.interest_leads
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_email text;

create index if not exists enrollment_leads_archived_at_idx
  on public.enrollment_leads (archived_at);

create index if not exists interest_leads_archived_at_idx
  on public.interest_leads (archived_at);
