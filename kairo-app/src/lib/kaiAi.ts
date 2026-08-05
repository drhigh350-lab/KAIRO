import { getSupabase } from './supabaseClient';

export type KaiGenerateKind = 'coaching_note' | 'weekly_reflection' | 'monthly_wrapped' | 'explain_followup';

/**
 * Calls the kai-generate Supabase Edge Function to turn already-computed
 * Kairo signals into real, generative Kai language (Gemini-backed). Every
 * caller must already have a template/rule-based fallback ready — this
 * returns null on any failure (network, missing GEMINI_API_KEY, timeout),
 * never throws, so a slow or unconfigured AI layer never blocks or breaks
 * the screen it's enhancing.
 */
export async function generateKaiText(kind: KaiGenerateKind, context: Record<string, unknown>, timeoutMs = 6000): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('kai-generate', {
      body: { kind, context },
      timeout: timeoutMs,
    });
    if (error) return null;
    const text = (data as { text?: string } | null)?.text;
    return text && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
