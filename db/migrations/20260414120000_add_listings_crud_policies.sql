alter table public.listings enable row level security;

drop policy if exists "listings readable by everyone" on public.listings;
create policy "listings readable by everyone"
on public.listings
for select
to authenticated, anon
using (true);

drop policy if exists "owners can create listings" on public.listings;
create policy "owners can create listings"
on public.listings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "owners can update listings" on public.listings;
create policy "owners can update listings"
on public.listings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
