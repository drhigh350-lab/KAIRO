import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Lazy singleton — only throws (missing env vars) when auth is actually attempted,
 * not at module load, so a misconfigured .env doesn't crash the whole bundle on boot.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy kairo-app/.env.example to .env and fill in real values.');
  }
  client = createClient(url, anonKey);
  return client;
}
