-- The one-off gallery routes run only on the trusted server with a Supabase secret key.
-- Grant the service role the table privileges required by the Data API while keeping
-- all public/anonymous access closed and RLS enabled on the exposed tables.

grant usage on schema public to service_role;

grant select, insert, update, delete
on table
  public.galleries,
  public.gallery_members,
  public.photos,
  public.assets,
  public.gallery_share_links
to service_role;

grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to service_role;

alter default privileges in schema public
grant usage, select on sequences to service_role;
