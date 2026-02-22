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

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Add them to .env.local or Vercel environment settings.',
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}
