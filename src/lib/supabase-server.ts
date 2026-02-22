import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Get a Supabase server client using the service role key.
 * This client bypasses RLS and should only be used in server-side code.
 */
export function getSupabaseServer(): SupabaseClient {
  if (_client) return _client;

  const url: string | undefined = process.env.SUPABASE_URL;
  const key: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      `SUPABASE_URL is ${url === undefined ? 'undefined' : `"${url}"`}. ` +
      'Set it in .env.local or Vercel environment settings.',
    );
  }

  if (!key) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is ${key === undefined ? 'undefined' : `"${key}"`}. ` +
      'Set it in Vercel environment settings (Dashboard → Settings → API → service_role).',
    );
  }

  console.log('[supabase] Creating client for', url, '| key length:', key.length);

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'vexnexa-scan' } },
  });

  return _client;
}
