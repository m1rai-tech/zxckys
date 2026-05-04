drop policy if exists "participants can delete completed conversations" on public.conversations;
create policy "participants can delete completed conversations"
on public.conversations
for delete
to authenticated
using (
  (auth.uid() = buyer_id or auth.uid() = seller_id)
  and status = 'completed'
);
