# Supabase infrastructure

This directory is a version-controlled mirror of what's deployed against the
`kairo` schema on Supabase project `unbgborbhxzsotaieiun` — migrations and
Edge Functions are managed directly against the project (via the Supabase
dashboard/MCP tooling), not through a local `supabase db push` workflow, so
without this mirror there's no record of them anywhere in git.

- `migrations/` — SQL that's already been applied. Only new migrations
  written from this point forward are guaranteed to be captured here; the
  full history predates this directory.
- `functions/` — Edge Function source, kept in sync with what's deployed.

If you change one of these, apply/deploy it against the live project first
(Supabase MCP tools or the dashboard), then update the file here to match —
this directory documents reality, it doesn't drive a deploy pipeline.
