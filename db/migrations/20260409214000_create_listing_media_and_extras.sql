create table if not exists public.listing_extras (
  listing_id bigint primary key references public.listings(id) on delete cascade,
  photos text[] not null default '{}',
  tags text[] not null default '{}',
  attributes jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_listing_extras_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listing_extras_touch_updated_at on public.listing_extras;
create trigger listing_extras_touch_updated_at
before update on public.listing_extras
for each row
execute function public.touch_listing_extras_updated_at();

alter table public.listing_extras enable row level security;

drop policy if exists "listing extras readable by everyone" on public.listing_extras;
create policy "listing extras readable by everyone"
on public.listing_extras
for select
to authenticated, anon
using (true);

drop policy if exists "listing extras editable by owner" on public.listing_extras;
create policy "listing extras editable by owner"
on public.listing_extras
for all
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_extras.listing_id
      and listings.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_extras.listing_id
      and listings.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true)
on conflict (id) do nothing;

drop policy if exists "listing media public read" on storage.objects;
create policy "listing media public read"
on storage.objects
for select
to public
using (bucket_id = 'listing-media');

drop policy if exists "listing media authenticated upload" on storage.objects;
create policy "listing media authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'listing-media');

drop policy if exists "listing media authenticated update" on storage.objects;
create policy "listing media authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'listing-media')
with check (bucket_id = 'listing-media');

drop policy if exists "listing media authenticated delete" on storage.objects;
create policy "listing media authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'listing-media');
