alter table public.messages
add column if not exists attachment_url text,
add column if not exists attachment_type text;

alter table public.messages
drop constraint if exists messages_non_empty_body;

alter table public.messages
add constraint messages_body_or_attachment_required check (
  char_length(btrim(coalesce(body, ''))) > 0
  or attachment_url is not null
);

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

drop policy if exists "chat media public read" on storage.objects;
create policy "chat media public read"
on storage.objects
for select
to public
using (bucket_id = 'chat-media');

drop policy if exists "chat media authenticated upload" on storage.objects;
create policy "chat media authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'chat-media');

drop policy if exists "chat media authenticated update" on storage.objects;
create policy "chat media authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'chat-media')
with check (bucket_id = 'chat-media');

drop policy if exists "chat media authenticated delete" on storage.objects;
create policy "chat media authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'chat-media');
