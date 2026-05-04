alter table public.listings enable row level security;

drop policy if exists "owners can delete listings" on public.listings;
create policy "owners can delete listings"
on public.listings
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admin moderator can delete listings" on public.listings;
create policy "admin moderator can delete listings"
on public.listings
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'moderator')
      and profiles.is_banned = false
  )
);
