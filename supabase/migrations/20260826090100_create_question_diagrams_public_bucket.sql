-- Batch 2 (pre-launch bug fix): a real public bucket for question diagrams
-- so the client can render kairo.questions.image_url via getPublicUrl()
-- without ever needing a signed/authenticated URL. `public = true` serves
-- reads through Storage's public endpoint with no RLS check required (the
-- existing 'paid-resources' bucket is deliberately private/signed-URL-only
-- for gated content — this is the opposite case: content is free to view
-- once a student is in the app, so it needs no such gate). No RLS write
-- policy is added on purpose: with none defined, only the service role can
-- write, so anon/authenticated stay unable to upload or overwrite diagrams.
insert into storage.buckets (id, name, public)
values ('question-diagrams', 'question-diagrams', true)
on conflict (id) do nothing;
