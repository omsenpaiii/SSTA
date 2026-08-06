create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.provision_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.student_profiles (
    user_key,
    email,
    first_name,
    last_name,
    phone,
    origin,
    updated_at
  )
  values (
    new.id::text,
    lower(new.email),
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''),
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), ''),
    coalesce(
      nullif(btrim(coalesce(new.phone, '')), ''),
      nullif(btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
    ),
    'self_enrolled',
    now()
  )
  on conflict (user_key) do update
  set email = excluded.email,
      first_name = coalesce(public.student_profiles.first_name, excluded.first_name),
      last_name = coalesce(public.student_profiles.last_name, excluded.last_name),
      phone = coalesce(public.student_profiles.phone, excluded.phone),
      updated_at = now();

  return new;
end;
$$;

revoke all on function private.provision_student_profile() from public, anon, authenticated;

drop trigger if exists provision_student_profile_after_auth_user on auth.users;
create trigger provision_student_profile_after_auth_user
after insert or update of email, phone, raw_user_meta_data on auth.users
for each row execute function private.provision_student_profile();

insert into public.student_profiles (
  user_key,
  email,
  first_name,
  last_name,
  phone,
  origin,
  updated_at
)
select
  users.id::text,
  lower(users.email),
  nullif(btrim(coalesce(users.raw_user_meta_data ->> 'first_name', '')), ''),
  nullif(btrim(coalesce(users.raw_user_meta_data ->> 'last_name', '')), ''),
  coalesce(
    nullif(btrim(coalesce(users.phone, '')), ''),
    nullif(btrim(coalesce(users.raw_user_meta_data ->> 'phone', '')), '')
  ),
  'self_enrolled',
  now()
from auth.users as users
where users.email is not null
on conflict (user_key) do update
set email = excluded.email,
    first_name = coalesce(public.student_profiles.first_name, excluded.first_name),
    last_name = coalesce(public.student_profiles.last_name, excluded.last_name),
    phone = coalesce(public.student_profiles.phone, excluded.phone),
    updated_at = now();
