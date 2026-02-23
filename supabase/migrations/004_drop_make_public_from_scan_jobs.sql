-- ─── Drop make_public from scan_jobs ───
-- make_public is a scan *intent* that belongs on scan_reports.is_public.
-- The scan_jobs table is a transient queue — it should not carry report metadata.
-- The makePublic flag is now passed via result_json metadata from route → worker.

ALTER TABLE scan_jobs DROP COLUMN IF EXISTS make_public;
