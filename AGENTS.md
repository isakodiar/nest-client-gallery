# NEST Client Gallery — working agreements

## Product
Build a private, editorial photography delivery experience for NEST clients. The first collection is a Star Wars event gallery. The system must support multiple independent client galleries.

## Visual direction
- Editorial, restrained, photography-first.
- Warm off-white canvas, near-black typography, generous whitespace.
- Strong serif display typography paired with clean sans-serif interface text.
- Avoid generic dashboard patterns, loud gradients, excessive rounded cards, and unnecessary UI.
- Responsive layouts must feel intentionally art-directed on mobile, not merely compressed.

## Product requirements
- Individual client access; never make original client photographs publicly accessible.
- Use Supabase Auth with existing invited users only. Do not add open public registration.
- Keep the Storage bucket private. Generate short-lived signed URLs only after server-side authorization.
- Each client can access only galleries they own or are explicitly assigned to.
- Support image preview, lightbox navigation, individual downloads, and a ZIP collection download.
- Treat the public preview route as sample content only. Never place real client media there.

## Engineering
- Use Next.js App Router, TypeScript, Supabase SSR, and server-side authorization.
- Keep secrets out of source control. Only public Supabase URL and publishable key may use NEXT_PUBLIC_.
- Do not introduce a service-role key into browser code.
- Keep database access protected by RLS and maintain the SQL migration when changing the schema.
- Prefer small reusable components and accessible buttons, labels, focus states, and keyboard interactions.
- Before completing a change, run typecheck, lint, and production build when the environment allows it.
