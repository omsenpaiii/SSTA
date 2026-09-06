alter table public.interest_leads
  add column if not exists message text;

create table if not exists public.interest_lead_documents (
  id uuid primary key default gen_random_uuid(),
  interest_lead_id uuid not null references public.interest_leads(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0 and file_size <= 10485760),
  created_at timestamptz not null default now()
);

create index if not exists interest_lead_documents_lead_idx
  on public.interest_lead_documents (interest_lead_id, created_at);

alter table public.interest_lead_documents enable row level security;
revoke all on table public.interest_lead_documents from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'interest-lead-documents',
  'interest-lead-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Uploads and downloads are performed only by server routes using the service key.
-- No client storage policies are created for this sensitive, private bucket.
