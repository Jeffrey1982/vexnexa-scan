-- Create scan_reports table
CREATE TABLE IF NOT EXISTS scan_reports (
  id uuid PRIMARY KEY,
  domain text UNIQUE NOT NULL,
  private_token uuid NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  scope_pages int NOT NULL DEFAULT 1,
  score int NOT NULL DEFAULT 0,
  wcag_level text NOT NULL DEFAULT '2.2 AA',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_scanned_at timestamptz NOT NULL DEFAULT now(),
  opted_out boolean NOT NULL DEFAULT false
);

-- Index for domain lookups
CREATE INDEX IF NOT EXISTS idx_scan_reports_domain ON scan_reports (domain);

-- Index for public report listings (sitemap)
CREATE INDEX IF NOT EXISTS idx_scan_reports_public ON scan_reports (is_public) WHERE is_public = true AND opted_out = false;

-- Create scan_opt_outs table
CREATE TABLE IF NOT EXISTS scan_opt_outs (
  domain text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
