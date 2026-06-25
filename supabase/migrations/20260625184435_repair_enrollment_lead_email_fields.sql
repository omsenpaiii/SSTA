alter table public.enrollment_leads
add column if not exists email_status text not null default 'pending'
check (email_status in ('pending', 'sent', 'failed'));

alter table public.enrollment_leads
add column if not exists email_error text;

alter table public.enrollment_leads
add column if not exists email_sent_at timestamptz;
