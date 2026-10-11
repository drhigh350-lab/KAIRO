# Static question catalog

This directory contains the **4,681 questions whose Supabase `kairo.questions.lifecycle_state` was `live` at export time**, split into one JSON file per subject under `v1/`. Imported/draft/non-live rows are intentionally excluded.

The app requests only the subject pack it needs. `SupabaseSyncAdapter.fetchQuestions()` delegates to this static source in the app; student-specific profiles, attempts, concept states, auth, and sync remain on Supabase. A subject pack is also cached by the browser/CDN, then mirrored into the existing IndexedDB queue by the engine.

Question `imageUrl` values are unchanged public URLs into the existing Supabase Storage `question-diagrams` bucket. **Diagram/image binaries are not copied into GitHub**; the URLs stay in these records so existing image rendering continues to work.

## Files

- `v1/manifest.json` — export count and subject/image counts.
- `v1/biology.json`
- `v1/chemistry.json`
- `v1/mathematics.json`
- `v1/physics.json`
- `v1/use-of-english.json`

The versioned path is an intentional cache-busting boundary. For a future refreshed export, regenerate the packs and bump the app loader path from `v1` to `v2` (or otherwise invalidate the CDN/browser cache) when changing the data.

## Refreshing the catalog

Export the required columns from `kairo.questions` using `lifecycle_state = 'live'`, ordered by `id`, into a JSON array. Pass that array to `kairo-app/scripts/build-question-catalog.mjs` to validate, map the database snake_case fields to the engine's camelCase question shape, and split the subject files. The script refuses non-live rows, unknown subjects, missing IDs, and duplicate IDs.
