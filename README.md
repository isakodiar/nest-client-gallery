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
