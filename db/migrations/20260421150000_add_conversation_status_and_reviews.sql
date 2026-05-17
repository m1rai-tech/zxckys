alter table if exists public.conversations
  add column if not exists status text not null default 'open',
  add column if not exists shipped_at timestamptz,
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_status_check'
  ) then
    alter table public.conversations
      add constraint conversations_status_check
      check (status in ('open', 'awaiting_confirmation', 'completed', 'cancelled'));
  end if;
end;
$$;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  listing_id bigint not null,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  buyer_name text not null default 'Buyer',
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 3 and 1000),
  created_at timestamptz not null default now(),
  constraint reviews_buyer_seller_distinct check (buyer_id <> seller_id)
);

create index if not exists reviews_seller_id_created_at_idx on public.reviews (seller_id, created_at desc);
create index if not exists reviews_buyer_id_idx on public.reviews (buyer_id);

alter table public.reviews enable row level security;

drop policy if exists "reviews readable by everyone" on public.reviews;
create policy "reviews readable by everyone"
on public.reviews
for select
to authenticated, anon
using (true);

drop policy if exists "buyers can insert own review after delivery" on public.reviews;
create policy "buyers can insert own review after delivery"
on public.reviews
for insert
to authenticated
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.conversations
    where conversations.id = reviews.conversation_id
      and conversations.buyer_id = auth.uid()
      and conversations.seller_id = reviews.seller_id
      and conversations.listing_id = reviews.listing_id
      and conversations.status in ('awaiting_confirmation', 'completed')
  )
);

create or replace function public.sync_profile_review_stats(target_seller_id uuid)
returns void
language plpgsql
as $$
declare
  next_rating numeric;
  next_completed_deals integer;
begin
  select
    coalesce(round(avg(rating)::numeric, 1), 0),
    count(*)
  into next_rating, next_completed_deals
  from public.reviews
  where seller_id = target_seller_id;

  update public.profiles
  set
    rating = next_rating,
    completed_deals = next_completed_deals,
    updated_at = now()
  where id = target_seller_id;
end;
$$;

create or replace function public.handle_review_profile_sync()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_profile_review_stats(old.seller_id);
    return old;
  end if;

  perform public.sync_profile_review_stats(new.seller_id);

  if tg_op = 'UPDATE' and old.seller_id <> new.seller_id then
    perform public.sync_profile_review_stats(old.seller_id);
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_sync_profile_stats on public.reviews;
create trigger reviews_sync_profile_stats
after insert or update or delete on public.reviews
for each row
execute function public.handle_review_profile_sync();
