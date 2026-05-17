create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Seller',
  full_name text not null default 'Seller',
  phone text,
  bio text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  is_banned boolean not null default false,
  is_verified boolean not null default false,
  rating numeric not null default 0,
  completed_deals integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by everyone" on public.profiles;
create policy "profiles readable by everyone"
on public.profiles
for select
to authenticated, anon
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id bigint not null,
  listing_title text not null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_name text not null,
  seller_name text not null,
  last_message text not null default '',
  last_message_at timestamptz,
  last_message_author_id uuid references auth.users(id) on delete set null,
  buyer_last_read_at timestamptz,
  seller_last_read_at timestamptz,
  status text not null default 'open',
  shipped_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_unique_listing_pair unique (listing_id, buyer_id, seller_id),
  constraint conversations_distinct_participants check (buyer_id <> seller_id),
  constraint conversations_status_check check (status in ('open', 'awaiting_confirmation', 'completed', 'cancelled'))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text,
  attachment_url text,
  attachment_type text,
  created_at timestamptz not null default now(),
  constraint messages_body_or_attachment_required check (
    coalesce(char_length(btrim(body)), 0) > 0
    or attachment_url is not null
  )
);

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

create index if not exists conversations_buyer_id_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations (seller_id);
create index if not exists conversations_updated_at_idx on public.conversations (updated_at desc);
create index if not exists messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);
create index if not exists reviews_seller_id_created_at_idx on public.reviews (seller_id, created_at desc);
create index if not exists reviews_buyer_id_idx on public.reviews (buyer_id);

create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_touch_updated_at on public.conversations;
create trigger conversations_touch_updated_at
before update on public.conversations
for each row
execute function public.touch_conversation_updated_at();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "participants can read conversations" on public.conversations;
create policy "participants can read conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "participants can create conversations" on public.conversations;
create policy "participants can create conversations"
on public.conversations
for insert
to authenticated
with check (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "participants can update conversations" on public.conversations;
create policy "participants can update conversations"
on public.conversations
for update
to authenticated
using (auth.uid() = buyer_id or auth.uid() = seller_id)
with check (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "participants can delete completed conversations" on public.conversations;
create policy "participants can delete completed conversations"
on public.conversations
for delete
to authenticated
using (
  (auth.uid() = buyer_id or auth.uid() = seller_id)
  and status = 'completed'
);

drop policy if exists "participants can read messages" on public.messages;
create policy "participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
  )
);

drop policy if exists "participants can send messages" on public.messages;
create policy "participants can send messages"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
  )
);

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

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end;
$$;

