create policy "Interest documents are server-managed"
on public.interest_lead_documents
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
