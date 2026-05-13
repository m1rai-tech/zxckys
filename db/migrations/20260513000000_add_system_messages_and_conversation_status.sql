-- Add is_system flag to messages for system-generated events
alter table public.messages
add column if not exists is_system boolean not null default false;

-- Add status + timestamps to conversations (idempotent — safe to re-run)
alter table public.conversations
add column if not exists status text not null default 'open';

alter table public.conversations
add column if not exists shipped_at timestamptz;

alter table public.conversations
add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'conversations_status_check'
  ) then
    alter table public.conversations
    add constraint conversations_status_check
    check (status in ('open', 'awaiting_confirmation', 'completed', 'cancelled'));
  end if;
end;
$$;
