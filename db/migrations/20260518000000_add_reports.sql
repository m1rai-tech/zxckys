create table if not exists reports (
  id          uuid        primary key default gen_random_uuid(),
  listing_id  uuid        not null references listings(id) on delete cascade,
  reporter_id uuid        not null references profiles(id) on delete cascade,
  reason      text        not null,
  status      text        not null default 'pending',
  resolved_by uuid        references profiles(id),
  resolved_at timestamptz,
  created_at  timestamptz not null default now(),
  unique(listing_id, reporter_id)
);

alter table reports enable row level security;

-- Authenticated users can submit reports
create policy "users_insert_reports" on reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

-- Users see their own reports; mods/admins see all
create policy "users_select_reports" on reports
  for select to authenticated
  using (
    reporter_id = auth.uid()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );

-- Only mods/admins can update (dismiss) reports
create policy "mods_update_reports" on reports
  for update to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );
