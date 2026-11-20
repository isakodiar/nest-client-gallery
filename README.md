# NEST Creative Delivery

A private, editorial client-delivery experience for NEST projects.

## Current first version

- Editorial landing page and client access screen.
- Public design preview at /preview using temporary stock imagery only.
- Invitation-only email magic-link authentication through Supabase.
- Private Supabase Storage bucket with row-level security.
- Authenticated collection index at /collections and individual galleries at /g/[slug].
- Image lightbox navigation, individual original downloads, and ZIP collection download.
- Responsive layouts for desktop and mobile.
- Database foundation for future video, audio, document, archive, and editable project-file delivery.

## Local development

1. Install Node.js 20.9 or newer.
2. Copy .env.example to .env.local.
3. Add the Supabase project URL and publishable key.
4. Install dependencies with npm install.
5. Start the app with npm run dev.

The visual preview at /preview can be reviewed before Supabase is configured. Real client access requires Supabase setup.

## Supabase setup

1. Create a Supabase project.
2. Run supabase/migrations/0001_gallery_schema.sql in the Supabase SQL Editor.
3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the local environment and Vercel project settings.
4. In Supabase Authentication, create the client users. Public sign-up is intentionally disabled in the login form; only existing users can request a sign-in link.
5. Add the deployed app URL and the local callback URL (/auth/callback) to the Supabase Auth redirect URL allowlist.
6. Create a gallery row and assign the client in gallery_members.
7. Upload original photographs and optimized previews to the private gallery-media bucket:
   - GALLERY_UUID/originals/filename.jpg
   - GALLERY_UUID/previews/filename.webp
8. Add one row per photograph to public.photos. Set storage_path to the original file path and preview_path to the optimized preview path.
9. For future non-image deliverables, use public.assets with asset_type set to video, audio, document, archive, project, or other. Store these files under GALLERY_UUID/assets/filename. The current client-facing gallery UI is still image-first; video and general file presentation will be added in a later iteration.

Example gallery record (replace the UUID with the authorized NEST owner user ID):

    insert into public.galleries (slug, title, client_name, description, event_date, owner_id, is_published)
    values ('star-wars', 'STAR WARS', 'NEST CLIENT', 'Private photography collection.', '2026-11-15', 'OWNER_USER_UUID', true);

Example client assignment (replace both UUIDs):

    insert into public.gallery_members (gallery_id, user_id)
    values ('GALLERY_UUID', 'CLIENT_USER_UUID');

Example photo record:

    insert into public.photos (gallery_id, storage_path, preview_path, filename, alt_text, sort_order)
    values ('GALLERY_UUID', 'GALLERY_UUID/originals/frame-01.jpg', 'GALLERY_UUID/previews/frame-01.webp', 'frame-01.jpg', 'Star Wars event photograph', 1);

Example future asset record:

    insert into public.assets (gallery_id, asset_type, storage_path, filename, mime_type, file_size, sort_order)
    values ('GALLERY_UUID', 'video', 'GALLERY_UUID/assets/highlights.mp4', 'highlights.mp4', 'video/mp4', 25000000, 1);

The initial private bucket migration sets a 50 MB per-file limit. This is a conservative starting point; larger video and project files may require a higher Supabase plan limit and a resumable upload flow.

## Deployment

Import this repository into Vercel, use the Next.js framework preset, and add the two Supabase environment variables. Deploy after the Supabase migration and authorized user are ready.

## Important privacy notes

- The gallery-media bucket must remain private.
- Never upload client originals to a public folder or the Git repository.
- Never expose a Supabase service-role key in a NEXT_PUBLIC_ variable or browser code.
- Client users must be explicitly assigned to galleries.
- The public /preview route uses stock sample imagery only and must never be used for actual client deliveries.

## Current scope / next iteration

This is the first client-facing version. The current gallery UI displays photographs. The database and private storage are prepared to register other asset types, but video playback, general file downloads, bulk uploads, automatic preview generation, project administration, and client invitations still need to be implemented.

## Low-friction one-time delivery (work in progress on feature branch)

One-time customers should **not** need to log in. NEST can send a private direct
link via WhatsApp: `https://nestclientgallery.netlify.app/s/<64-character-token>`.

The original authenticated flow at `/login`, `/collections`, and `/g/[slug]`
remains available for recurrent/monthly clients.

### Setup and privacy

1. Apply `supabase/migrations/0002_client_share_links.sql` in the Supabase SQL Editor,
   **after** the original database migration.
2. In Netlify, set `SUPABASE_SECRET_KEY` using the project's **new** `sb_secret_...`
   key. Restrict this environment variable to server-side Functions, including
   production and previews as appropriate. **Never prefix it with `NEXT_PUBLIC_`,
   and never send it to a customer or commit it to GitHub.**
3. Redeploy the Next.js app. The share routes run on the server and authorize a
   hash of the link token **before** accessing Supabase with its secret key.
4. Keep Storage `gallery-media` private; do not grant anonymous SELECT access
   to Storage or galleries.
5. The gallery must have `is_published = true` and its photos registered in
   `public.photos`. Unpublished galleries remain inaccessible even with a link.
6. Generate a random share link in Supabase SQL Editor:

```sql
-- Replace the slug with a gallery that has already been created and published.
with generated as (
  select encode(gen_random_bytes(32), 'hex') as token
), created as (
  insert into public.gallery_share_links (gallery_id, token_hash, expires_at)
  select g.id, encode(digest(generated.token, 'sha256'), 'hex'),
         now() + interval '30 days'
  from public.galleries g cross join generated
  where g.slug = 'star-wars' and g.is_published = true
  returning id
)
select created.id as link_id,
       'https://nestclientgallery.netlify.app/s/' || generated.token as private_url
from generated cross join created;
```

The returned private URL is the **only** copy of the raw token. Copy it directly
into the customer's WhatsApp conversation, and avoid forwarding it elsewhere.
Store the `link_id` if you need to revoke it. To revoke from SQL Editor:

```sql
-- Replace with the link_id returned when the link was created.
update public.gallery_share_links
set revoked_at = now()
where id = 'REPLACE-WITH-LINK-UUID';
```

Anyone possessing a valid token can access that gallery until the link expires
or is revoked. Unlike an authenticated user, a link holder is **not** personally
identified. Never reuse links across clients. The page disables indexing,
referrers and caching. Supabase preview URLs expire after 10 minutes and file
download URLs after 60 seconds; signed URLs already minted may stay usable for
their remaining lifetime even after a share link is revoked.

### Downloading complete galleries larger than the Free-tier per-file limit

This project intentionally **does not** assemble a large ZIP in a Netlify Function,
because serverless response-size/memory limits can interrupt downloads.

Instead, create one or more ZIP parts, each below the bucket's configured
50 MB file-size limit. Upload them to
`gallery-media/GALLERY_UUID/assets/` and register each in `public.assets`:

```sql
insert into public.assets
  (gallery_id, asset_type, storage_path, filename, mime_type, sort_order)
values
  ('GALLERY_UUID', 'archive', 'GALLERY_UUID/assets/star-wars-01.zip',
   'star-wars-01.zip', 'application/zip', 1),
  ('GALLERY_UUID', 'archive', 'GALLERY_UUID/assets/star-wars-02.zip',
   'star-wars-02.zip', 'application/zip', 2);
```

The direct-link gallery shows a download button for each archive part,
while also supporting individual photo downloads.
In the future, NEST will provide an administrator dashboard to create/revoke
links and upload collection ZIPs without using SQL Editor.


## SKYWALKER one-time delivery (administrator upload)

This delivery uses a **direct private link**, not email sign-in. The existing email-based
`/login` flow remains available for recurrent/monthly clients.

1. Apply migrations `0002_client_share_links.sql` and `0003_one_off_gallery_owner.sql`
   to the NEST Supabase project (already applied to the connected project).
2. In Netlify Site configuration → Environment variables, add:
   - `SUPABASE_SECRET_KEY`: the project's server-only `sb_secret_...` key.
   - `NEST_ADMIN_CODE`: a long random administrator password, at least 32 characters.
   - `NEXT_PUBLIC_SITE_URL`: `https://nestclientgallery.netlify.app`.
3. Keep `SUPABASE_SECRET_KEY` and `NEST_ADMIN_CODE` server-only. Never add a
   `NEXT_PUBLIC_` prefix to either secret. Do not place them in GitHub or send them in chat.
4. Deploy the `feature/direct-client-share-links` branch to a Netlify Deploy Preview.
5. Open `/admin/skywalker`, enter the administrator code and upload the ZIP containing
   exactly 38 JPG/PNG/WEBP photographs. The upload route processes one image per request,
   keeps originals and WebP previews in the private `gallery-media` bucket, and orders
   `andy anakin (20).png` as the cover.
6. After all 38 photos are stored, the app publishes the gallery and creates a random,
   90-day private link at `/s/<token>`. Copy that link to the client.
7. The client can view the gallery without an account or email, download each original,
   or download all originals as a ZIP generated in the browser.

The one-time gallery is not listed publicly and Storage remains private. A valid share
link is a bearer credential: anyone who has it can view and download the collection until
it expires or is revoked. Keep it limited to the intended client.
