-- Optional direct access for one-off clients, without changing existing email authentication.
-- A 32-byte random token is shared with the customer; only its SHA-256 hash is stored.
-- Keep the gallery-media bucket private and never add anonymous Storage SELECT policies.

create table if not exists public.gallery_share_links (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists gallery_share_links_gallery_id_idx on public.gallery_share_links(gallery_id);
create index if not exists gallery_share_links_expires_at_idx on public.gallery_share_links(expires_at);
alter table public.gallery_share_links enable row level security;

grant select, insert, update, delete on public.gallery_share_links to authenticated;

drop policy if exists "Gallery owners manage access links" on public.gallery_share_links;
create policy "Gallery owners manage access links"
on public.gallery_share_links for all to authenticated
using (public.is_gallery_owner(gallery_id))
with check (public.is_gallery_owner(gallery_id));

-- Anonymous visitors can never query this table or private photos directly.
-- Server routes validate the token then use a server-only Supabase secret key
-- to create short-lived signed URLs for specific, authorized private objects.
