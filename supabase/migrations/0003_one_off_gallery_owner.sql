-- One-time galleries can be owned by a private share link rather than a Supabase user.
-- Recurrent client galleries may continue to set owner_id and use the authenticated flow.
alter table public.galleries
  alter column owner_id drop not null;
