-- ============================================================
-- 006_drop_legacy_columns.sql
-- ⚠️  DESTRUCTIVE — Run ONLY after confirming:
--   1. Production has been stable on 005_canonical_schema.sql
--   2. No data in _make_public_legacy is needed
--   3. You have a recent backup of the scan_jobs table
--
-- This permanently removes the renamed legacy column.
-- ============================================================

ALTER TABLE scan_jobs DROP COLUMN IF EXISTS _make_public_legacy;
ALTER TABLE scan_jobs DROP COLUMN IF EXISTS make_public;
