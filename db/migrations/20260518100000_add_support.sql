create table if not exists support_tickets (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references profiles(id) on delete set null,
  status     text        not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists support_messages (
  id         uuid        primary key default gen_random_uuid(),
  ticket_id  uuid        not null references support_tickets(id) on delete cascade,
  sender_id  uuid        references profiles(id) on delete set null,
  is_mod     boolean     not null default false,
  text       text        not null,
  created_at timestamptz not null default now()
);

alter table support_tickets  enable row level security;
alter table support_messages enable row level security;

-- Tickets: users create/view their own; mods see all
create policy "users_insert_tickets" on support_tickets
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "users_select_tickets" on support_tickets
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
  );

create policy "mods_update_tickets" on support_tickets
  for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator')));

-- Messages: users write to their own tickets; mods write to any
create policy "users_insert_support_messages" on support_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      exists (select 1 from support_tickets where id = ticket_id and user_id = auth.uid())
      or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
    )
  );

create policy "users_select_support_messages" on support_messages
  for select to authenticated
  using (
    exists (select 1 from support_tickets where id = ticket_id and user_id = auth.uid())
    or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
  );
