-- boosted_until: when the paid promotion expires (null = not boosted)
alter table public.listings
  add column if not exists boosted_until timestamptz;

create index if not exists listings_boosted_until_idx
  on public.listings (boosted_until desc nulls last);
