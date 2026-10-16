import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Checks whether Supabase environment variables are present and configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return typeof url === 'string' && url.trim().length > 0 && typeof anonKey === 'string' && anonKey.trim().length > 0;
}

/**
 * Lazy singleton — only throws (missing env vars) when auth is actually attempted,
 * not at module load, so a misconfigured .env doesn't crash the whole bundle on boot.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — running in local-first mode.');
  }
  client = createClient(url, anonKey);
  return client;
}
