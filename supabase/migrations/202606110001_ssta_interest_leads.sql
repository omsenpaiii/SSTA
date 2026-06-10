-- Create interest_leads table for homepage popups and general enquiry leads
create table if not exists public.interest_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  course_slug text not null references public.courses(slug) on delete restrict,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.interest_leads enable row level security;

-- Index for fast queries
create index if not exists idx_interest_leads_email
on public.interest_leads (email);

create index if not exists idx_interest_leads_course
on public.interest_leads (course_slug);
