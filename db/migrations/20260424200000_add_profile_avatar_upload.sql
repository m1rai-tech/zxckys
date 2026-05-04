alter table if exists public.profiles
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "profile avatars public read" on storage.objects;
create policy "profile avatars public read"
on storage.objects
for select
to public
using (bucket_id = 'profile-avatars');

drop policy if exists "profile avatars authenticated upload own" on storage.objects;
create policy "profile avatars authenticated upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile avatars authenticated update own" on storage.objects;
create policy "profile avatars authenticated update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile avatars authenticated delete own" on storage.objects;
create policy "profile avatars authenticated delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
