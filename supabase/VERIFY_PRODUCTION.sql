-- ============================================================
-- VERIFY_PRODUCTION.sql
-- Run these queries in the Supabase SQL Editor after applying
-- 005_canonical_schema.sql to confirm the schema is correct.
-- ============================================================

-- ─── 1. Confirm all expected tables exist ───
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('scan_jobs', 'scan_reports', 'scan_opt_outs', 'report_views')
ORDER BY table_name;
-- Expected: 4 rows

-- ─── 2. Confirm scan_jobs has all required columns ───
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scan_jobs'
ORDER BY ordinal_position;
-- Required columns (13):
--   id, domain, scan_url, status, created_at, started_at,
--   completed_at, expires_at, ip, is_admin, duration_ms, error, result_json
-- Optional legacy: _make_public_legacy (harmless, will be dropped in 006)

-- ─── 3. Confirm scan_reports has all required columns ───
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scan_reports'
ORDER BY ordinal_position;
-- Required columns (11):
--   id, domain, private_token, is_public, scope_pages, score,
--   wcag_level, data, created_at, last_scanned_at, opted_out

-- ─── 4. Confirm report_views has all required columns ───
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'report_views'
ORDER BY ordinal_position;
-- Required columns (5): id, domain, viewed_at, referrer, user_agent

-- ─── 5. Confirm scan_opt_outs has all required columns ───
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scan_opt_outs'
ORDER BY ordinal_position;
-- Required columns (2): domain, created_at

-- ─── 6. Quick sanity: scan_jobs row counts by status ───
SELECT status, count(*) AS cnt
FROM scan_jobs
GROUP BY status
ORDER BY cnt DESC;

-- ─── 7. Quick sanity: total scan_reports ───
SELECT count(*) AS total_reports,
       count(*) FILTER (WHERE is_public = true) AS public_reports,
       count(*) FILTER (WHERE opted_out = true) AS opted_out_reports
FROM scan_reports;

-- ─── 8. Confirm required indexes exist ───
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('scan_jobs', 'scan_reports', 'report_views')
ORDER BY tablename, indexname;
-- Expected indexes for scan_jobs:
--   idx_scan_jobs_active, idx_scan_jobs_created_at,
--   idx_scan_jobs_domain, idx_scan_jobs_status
-- Expected indexes for scan_reports:
--   idx_scan_reports_domain, idx_scan_reports_public
-- Expected indexes for report_views:
--   idx_report_views_domain, idx_report_views_viewed_at

-- ─── 9. Confirm RLS is enabled ───
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('scan_jobs', 'scan_reports', 'scan_opt_outs', 'report_views')
ORDER BY tablename;
-- All should show rowsecurity = true

-- ─── 10. Confirm make_public is gone (or renamed) ───
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'scan_jobs'
  AND column_name IN ('make_public', '_make_public_legacy');
-- Expected: 0 rows (if 006 was run) or 1 row (_make_public_legacy)
-- Should NOT show 'make_public'
