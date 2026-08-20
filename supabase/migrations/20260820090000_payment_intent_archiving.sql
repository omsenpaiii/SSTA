alter table public.payment_intents
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_email text;

create index if not exists payment_intents_archived_at_idx
  on public.payment_intents (archived_at);
