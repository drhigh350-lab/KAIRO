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
  const result = await generateKaiTextWithDiagnostics(kind, context, timeoutMs);
  return result.text;
}

export interface KaiGenerateDiagnosticResult {
  text: string | null;
  /** Only set on failure — safe to surface in-UI while diagnosing why calls to kai-generate aren't reaching Supabase at all. */
  errorDetail?: string;
}

/**
 * Same call as generateKaiText, but never swallows the failure reason —
 * used by KaiPanel's follow-up actions right now specifically to find out
 * WHY calls are failing (edge function logs show zero incoming requests
 * at all for some failed attempts, which points to something failing
 * before the network call ever leaves the browser).
 */
export async function generateKaiTextWithDiagnostics(kind: KaiGenerateKind, context: Record<string, unknown>, timeoutMs = 6000): Promise<KaiGenerateDiagnosticResult> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('kai-generate', {
      body: { kind, context },
      timeout: timeoutMs,
    });
    if (error) {
      const name = error instanceof Error ? error.name : typeof error;
      const message = error instanceof Error ? error.message : String(error);
      const status = (error as { context?: { status?: number } })?.context?.status;
      return { text: null, errorDetail: `${name}${status ? ` (${status})` : ''}: ${message}` };
    }
    const text = (data as { text?: string } | null)?.text;
    return text && text.trim() ? { text: text.trim() } : { text: null, errorDetail: 'Empty response from kai-generate' };
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { text: null, errorDetail: message };
  }
}
