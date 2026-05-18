-- Ban fields on profiles
alter table profiles
  add column if not exists banned_until timestamptz,
  add column if not exists ban_reason text;

-- Extend reports for user reports from chat
alter table reports
  add column if not exists conversation_id uuid references conversations(id) on delete set null,
  add column if not exists reported_user_id uuid references profiles(id) on delete cascade;

-- Make listing_id nullable (was NOT NULL)
alter table reports alter column listing_id drop not null;

-- Replace old unique constraint with partial indexes
alter table reports drop constraint if exists reports_listing_id_reporter_id_key;
create unique index if not exists reports_listing_reporter_uniq
  on reports (listing_id, reporter_id) where listing_id is not null;
create unique index if not exists reports_user_reporter_uniq
  on reports (reported_user_id, reporter_id) where reported_user_id is not null;

-- Reports: re-create insert policy to allow user reports too
drop policy if exists "users_insert_reports" on reports;
create policy "users_insert_reports" on reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

-- Reports: re-create select policy
drop policy if exists "users_select_reports" on reports;
create policy "users_select_reports" on reports
  for select to authenticated
  using (
    reporter_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
  );

drop policy if exists "mods_update_reports" on reports;
create policy "mods_update_reports" on reports
  for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator')));

-- Allow admins/mods to update any profile (for banning)
drop policy if exists "admins_update_profiles" on profiles;
drop policy if exists "users_update_own_profile" on profiles;
create policy "users_update_own_profile" on profiles
  for update to authenticated
  using (
    auth.uid() = id
    or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
  );

-- Allow admins/mods to read all conversations
drop policy if exists "mods_select_all_conversations" on conversations;
create policy "mods_select_all_conversations" on conversations
  for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator')));

-- Allow admins/mods to read all messages
drop policy if exists "mods_select_all_messages" on messages;
create policy "mods_select_all_messages" on messages
  for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator')));
