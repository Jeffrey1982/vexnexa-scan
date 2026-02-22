// Re-export the server-side Supabase client as supabaseAdmin.
// This is an alias for supabase-server.ts for code that expects `supabaseAdmin`.
import { getSupabaseServer } from './supabase-server';

export const supabaseAdmin = getSupabaseServer;
