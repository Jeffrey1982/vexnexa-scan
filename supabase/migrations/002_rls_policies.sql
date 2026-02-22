-- Enable RLS on scan_reports
ALTER TABLE scan_reports ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypasses RLS automatically, but explicit for clarity)
-- The service_role key used in supabase-server.ts bypasses RLS by default.

-- Public select policy: anyone can read public, non-opted-out reports
CREATE POLICY "Public reports visible"
  ON scan_reports
  FOR SELECT
  USING (is_public = true AND opted_out = false);

-- Service role can do everything (insert/update/delete) via service_role key bypass.
-- No additional policies needed for server-side operations.

-- Enable RLS on scan_opt_outs
ALTER TABLE scan_opt_outs ENABLE ROW LEVEL SECURITY;

-- No public read needed for opt-outs — only accessed via service role.
