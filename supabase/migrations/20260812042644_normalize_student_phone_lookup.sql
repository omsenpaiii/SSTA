-- Store valid Australian student phone numbers in E.164 format so admin imports,
-- OTP identity reconciliation, and profile lookup all use the same representation.
update public.student_profiles
set phone = case
  when regexp_replace(phone, '\D', '', 'g') ~ '^61[0-9]{9}$'
    then '+' || regexp_replace(phone, '\D', '', 'g')
  when regexp_replace(phone, '\D', '', 'g') ~ '^0[0-9]{9}$'
    then '+61' || substr(regexp_replace(phone, '\D', '', 'g'), 2)
  when regexp_replace(phone, '\D', '', 'g') ~ '^[0-9]{9}$'
    then '+61' || regexp_replace(phone, '\D', '', 'g')
  else phone
end,
updated_at = now()
where phone is not null
  and btrim(phone) <> ''
  and regexp_replace(phone, '\D', '', 'g') ~ '^(61[0-9]{9}|0[0-9]{9}|[0-9]{9})$';

create index if not exists student_profiles_phone_lookup_idx
  on public.student_profiles (phone)
  where phone is not null and btrim(phone) <> '';

comment on index public.student_profiles_phone_lookup_idx is
  'Normalized phone lookup for admin duplicate detection and Supabase phone OTP profile reconciliation.';
