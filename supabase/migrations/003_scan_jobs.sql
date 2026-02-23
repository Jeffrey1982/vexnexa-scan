-- ─── scan_jobs table ───
-- Persistent job queue for scan requests. Replaces in-memory store.
-- Workers pick up queued jobs, process them, and write results back.

CREATE TABLE IF NOT EXISTS scan_jobs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  domain        text        NOT NULL,
  scan_url      text        NOT NULL DEFAULT '',
  make_public   boolean     NOT NULL DEFAULT false,
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

-- Index for domain lookups (deduplication of active jobs)
CREATE INDEX IF NOT EXISTS idx_scan_jobs_domain ON scan_jobs (domain);

-- Index for status-based queries (worker picks up queued jobs)
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON scan_jobs (status);

-- Index for ordering by creation time (worker FIFO)
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created_at ON scan_jobs (created_at DESC);

-- Partial index for active jobs (queued or running, not expired)
CREATE INDEX IF NOT EXISTS idx_scan_jobs_active
  ON scan_jobs (domain, status)
  WHERE status IN ('queued', 'running');

-- ─── report_views table (Part F — view tracking) ───

CREATE TABLE IF NOT EXISTS report_views (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  domain      text        NOT NULL,
  viewed_at   timestamptz NOT NULL DEFAULT now(),
  referrer    text,
  user_agent  text
);

CREATE INDEX IF NOT EXISTS idx_report_views_domain ON report_views (domain);
CREATE INDEX IF NOT EXISTS idx_report_views_viewed_at ON report_views (viewed_at DESC);

-- ─── RLS ───

ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
-- No public read needed — only accessed via service role key.

ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;
-- No public read needed — only accessed via service role key.
