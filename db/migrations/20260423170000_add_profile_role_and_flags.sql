alter table if exists public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists is_banned boolean not null default false,
  add column if not exists is_verified boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'moderator', 'admin'));
  end if;
end;
$$;

