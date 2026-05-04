create extension if not exists pgcrypto;

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_unique_listing_pair unique (listing_id, buyer_id, seller_id),
  constraint conversations_distinct_participants check (buyer_id <> seller_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_non_empty_body check (char_length(btrim(body)) > 0)
);

create index if not exists conversations_buyer_id_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations (seller_id);
create index if not exists conversations_updated_at_idx on public.conversations (updated_at desc);
create index if not exists messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);

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
end;
$$;
