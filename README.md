# NEST Client Gallery

A private, editorial photography delivery experience for NEST clients.

## Current first version

- Editorial landing page and client access screen.
- Public design preview at /preview using temporary stock imagery only.
- Invitation-only email magic-link authentication through Supabase.
- Private Supabase Storage bucket with row-level security.
- Client gallery route at /g/[slug].
- Lightbox navigation, individual original downloads, and ZIP collection download.
- Responsive layouts for desktop and mobile.

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
4. Create client users from Supabase Authentication. Public sign-up is intentionally disabled in the login form; only existing users can request a sign-in link.
5. Create a gallery row and assign the client in gallery_members.
6. Upload original files to the private gallery-media bucket using this folder structure:
   - GALLERY_UUID/originals/filename.jpg
   - GALLERY_UUID/previews/filename.webp
7. Add one row per image to public.photos. Set storage_path to the original file path and preview_path to the optimized preview path.

Example gallery record (replace the UUID with the authorized NEST owner user ID):

    insert into public.galleries (slug, title, client_name, description, event_date, owner_id, is_published)
    values ('star-wars', 'STAR WARS', 'NEST CLIENT', 'Private photography collection.', '2026-11-15', 'OWNER_USER_UUID', true);

Example client assignment (replace both UUIDs):

    insert into public.gallery_members (gallery_id, user_id)
    values ('GALLERY_UUID', 'CLIENT_USER_UUID');

Example photo record:

    insert into public.photos (gallery_id, storage_path, preview_path, filename, alt_text, sort_order)
    values ('GALLERY_UUID', 'GALLERY_UUID/originals/frame-01.jpg', 'GALLERY_UUID/previews/frame-01.webp', 'frame-01.jpg', 'Star Wars event photograph', 1);

## Deployment

Import this repository into Vercel, use the Next.js framework preset, and add the two Supabase environment variables. Deploy after the Supabase migration and authorized user are ready.

## Important privacy notes

- The gallery-media bucket must remain private.
- Never upload client originals to the public folder or Git repository.
- Never expose a Supabase service-role key in a NEXT_PUBLIC_ variable or browser code.
- Client users must be explicitly assigned to galleries.
- The public /preview route uses stock sample imagery only and must never be used for actual client deliveries.

## Current scope / next iteration

This is the first client-facing version. It does not yet include a NEST admin dashboard for creating galleries, bulk-uploading images, generating previews, or inviting clients. Those capabilities can be added after the first gallery is connected and tested.
