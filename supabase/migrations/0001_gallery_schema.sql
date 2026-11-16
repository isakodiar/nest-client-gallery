create extension if not exists pgcrypto;

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client_name text not null,
  description text,
  event_date date,
  is_published boolean not null default false,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_members (
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (gallery_id, user_id)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  storage_path text not null,
  preview_path text,
  filename text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists galleries_owner_id_idx on public.galleries(owner_id);
create index if not exists gallery_members_user_id_idx on public.gallery_members(user_id);
create index if not exists photos_gallery_sort_idx on public.photos(gallery_id, sort_order);

alter table public.galleries enable row level security;
alter table public.gallery_members enable row level security;
alter table public.photos enable row level security;

create or replace function public.is_gallery_owner(target_gallery uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.galleries g
    where g.id = target_gallery and g.owner_id = auth.uid()
  );
$$;

create or replace function public.can_access_gallery(target_gallery uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.galleries g
    where g.id = target_gallery
      and (
        g.owner_id = auth.uid()
        or (
          g.is_published = true
          and exists (
            select 1 from public.gallery_members gm
            where gm.gallery_id = g.id and gm.user_id = auth.uid()
          )
        )
      )
  );
$$;

revoke all on function public.is_gallery_owner(uuid) from public;
revoke all on function public.can_access_gallery(uuid) from public;
grant execute on function public.is_gallery_owner(uuid) to authenticated;
grant execute on function public.can_access_gallery(uuid) to authenticated;

drop policy if exists "Members and owners can read galleries" on public.galleries;
create policy "Members and owners can read galleries"
on public.galleries for select to authenticated
using (public.can_access_gallery(id));

drop policy if exists "Owners can create galleries" on public.galleries;
create policy "Owners can create galleries"
on public.galleries for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Owners can update galleries" on public.galleries;
create policy "Owners can update galleries"
on public.galleries for update to authenticated
using (public.is_gallery_owner(id))
with check (public.is_gallery_owner(id));

drop policy if exists "Owners can delete galleries" on public.galleries;
create policy "Owners can delete galleries"
on public.galleries for delete to authenticated
using (public.is_gallery_owner(id));

drop policy if exists "Users can read their gallery membership" on public.gallery_members;
create policy "Users can read their gallery membership"
on public.gallery_members for select to authenticated
using (user_id = auth.uid() or public.is_gallery_owner(gallery_id));

drop policy if exists "Owners can add gallery members" on public.gallery_members;
create policy "Owners can add gallery members"
on public.gallery_members for insert to authenticated
with check (public.is_gallery_owner(gallery_id));

drop policy if exists "Owners can remove gallery members" on public.gallery_members;
create policy "Owners can remove gallery members"
on public.gallery_members for delete to authenticated
using (public.is_gallery_owner(gallery_id));

drop policy if exists "Gallery members can read photographs" on public.photos;
create policy "Gallery members can read photographs"
on public.photos for select to authenticated
using (public.can_access_gallery(gallery_id));

drop policy if exists "Owners can add photographs" on public.photos;
create policy "Owners can add photographs"
on public.photos for insert to authenticated
with check (public.is_gallery_owner(gallery_id));

drop policy if exists "Owners can update photographs" on public.photos;
create policy "Owners can update photographs"
on public.photos for update to authenticated
using (public.is_gallery_owner(gallery_id))
with check (public.is_gallery_owner(gallery_id));

drop policy if exists "Owners can delete photographs" on public.photos;
create policy "Owners can delete photographs"
on public.photos for delete to authenticated
using (public.is_gallery_owner(gallery_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-media',
  'gallery-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Gallery members can view private media" on storage.objects;
create policy "Gallery members can view private media"
on storage.objects for select to authenticated
using (
  bucket_id = 'gallery-media'
  and public.can_access_gallery(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Gallery owners can upload private media" on storage.objects;
create policy "Gallery owners can upload private media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'gallery-media'
  and public.is_gallery_owner(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Gallery owners can update private media" on storage.objects;
create policy "Gallery owners can update private media"
on storage.objects for update to authenticated
using (
  bucket_id = 'gallery-media'
  and public.is_gallery_owner(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'gallery-media'
  and public.is_gallery_owner(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Gallery owners can delete private media" on storage.objects;
create policy "Gallery owners can delete private media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'gallery-media'
  and public.is_gallery_owner(((storage.foldername(name))[1])::uuid)
);
