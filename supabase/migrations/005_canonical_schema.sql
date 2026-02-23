-- ============================================================
-- 005_canonical_schema.sql
-- Single idempotent migration that ensures the ENTIRE schema
-- matches what the application code expects.
-- Safe to run on a fresh DB or an existing one.
-- ============================================================

-- ─── Extensions ───
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLE: scan_reports
-- Used by: report-store.ts, get-public-reports.ts, worker
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_reports (
  id              uuid        PRIMARY KEY,
  domain          text        UNIQUE NOT NULL,
  private_token   uuid        NOT NULL,
  is_public       boolean     NOT NULL DEFAULT false,
  scope_pages     int         NOT NULL DEFAULT 1,
  score           int         NOT NULL DEFAULT 0,
  wcag_level      text        NOT NULL DEFAULT '2.2 AA',
  data            jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_scanned_at timestamptz NOT NULL DEFAULT now(),
  opted_out       boolean     NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_scan_reports_domain
  ON scan_reports (domain);
CREATE INDEX IF NOT EXISTS idx_scan_reports_public
  ON scan_reports (is_public) WHERE is_public = true AND opted_out = false;

-- ============================================================
-- TABLE: scan_opt_outs
-- Used by: report-store.ts (isDomainOptedOut, requestDomainRemoval)
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_opt_outs (
  domain     text        PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: scan_jobs
-- Used by: scan-job-store-supabase.ts, /api/scan, /api/scan/[id], worker
-- Columns MUST match ScanJobRow interface exactly.
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_jobs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  domain        text        NOT NULL,
  scan_url      text        NOT NULL DEFAULT '',
  status        text        NOT NULL DEFAULT 'queued'
                            CHECK (status IN ('queued','running','completed','failed','rejected','rate_limited')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  started_at    timestamptz,
  completed_at  timestamptz,
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  ip            text,
  is_admin      boolean     NOT NULL DEFAULT false,
  duration_ms   integer,
  error         text,
  result_json   jsonb
);

-- If the table already existed with make_public, rename it (non-destructive).
-- The code no longer reads/writes this column. It will be ignored by select('*').
-- Run 006_drop_legacy_columns.sql later to permanently remove it.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scan_jobs' AND column_name = 'make_public'
  ) THEN
    ALTER TABLE scan_jobs RENAME COLUMN make_public TO _make_public_legacy;
  END IF;
END $$;

-- Ensure every required column exists (for DBs created before this migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='scan_url') THEN
    ALTER TABLE scan_jobs ADD COLUMN scan_url text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='started_at') THEN
    ALTER TABLE scan_jobs ADD COLUMN started_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='completed_at') THEN
    ALTER TABLE scan_jobs ADD COLUMN completed_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='expires_at') THEN
    ALTER TABLE scan_jobs ADD COLUMN expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='ip') THEN
    ALTER TABLE scan_jobs ADD COLUMN ip text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='is_admin') THEN
    ALTER TABLE scan_jobs ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='duration_ms') THEN
    ALTER TABLE scan_jobs ADD COLUMN duration_ms integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='error') THEN
    ALTER TABLE scan_jobs ADD COLUMN error text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scan_jobs' AND column_name='result_json') THEN
    ALTER TABLE scan_jobs ADD COLUMN result_json jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_scan_jobs_domain     ON scan_jobs (domain);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status      ON scan_jobs (status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created_at  ON scan_jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_active      ON scan_jobs (domain, status) WHERE status IN ('queued', 'running');

-- ============================================================
-- TABLE: report_views
-- Used by: /api/report/view (POST)
-- ============================================================
CREATE TABLE IF NOT EXISTS report_views (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  domain      text        NOT NULL,
  viewed_at   timestamptz NOT NULL DEFAULT now(),
  referrer    text,
  user_agent  text
);

CREATE INDEX IF NOT EXISTS idx_report_views_domain    ON report_views (domain);
CREATE INDEX IF NOT EXISTS idx_report_views_viewed_at ON report_views (viewed_at DESC);

-- ============================================================
-- RLS — all tables accessed via service_role key only
-- ============================================================
ALTER TABLE scan_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_views  ENABLE ROW LEVEL SECURITY;

-- Public select policy for scan_reports (used by anon/public access for SEO pages)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scan_reports' AND policyname = 'Public reports visible'
  ) THEN
    CREATE POLICY "Public reports visible"
      ON scan_reports FOR SELECT
      USING (is_public = true AND opted_out = false);
  END IF;
END $$;

-- ============================================================
-- ENV VARS REQUIRED (document here for reference):
--   SUPABASE_URL              — Supabase project URL
--   SUPABASE_SERVICE_ROLE_KEY — service role key (server only, never client)
--   CRON_SECRET               — Vercel Cron auth (Authorization: Bearer)
--   VEXNEXA_ADMIN_SECRET      — admin bypass header value
-- ============================================================
