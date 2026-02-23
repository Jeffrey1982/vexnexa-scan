# Production Deployment Guide

## Prerequisites

- Supabase project with SQL Editor access
- Vercel project connected to this repo
- Environment variables configured (see below)

---

## 1. Run the Canonical Migration

Open **Supabase Dashboard → SQL Editor** and paste the contents of:

```
supabase/migrations/005_canonical_schema.sql
```

This migration is **idempotent and non-destructive**:
- Creates tables if they don't exist (`CREATE TABLE IF NOT EXISTS`)
- Adds missing columns if the table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`)
- Renames stale `make_public` column to `_make_public_legacy` (no data loss)
- Creates indexes and RLS policies only if they don't exist

**Do NOT run `006_drop_legacy_columns.sql` yet.** That is a destructive follow-up for later cleanup.

---

## 2. Verify the Schema

After running the migration, paste the contents of:

```
supabase/VERIFY_PRODUCTION.sql
```

Check that:
- All 4 tables exist: `scan_jobs`, `scan_reports`, `scan_opt_outs`, `report_views`
- `scan_jobs` has 13 required columns (no `make_public`, only `_make_public_legacy` if it existed)
- `scan_reports` has 11 required columns
- All indexes are present
- RLS is enabled on all tables

---

## 3. Required Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key from Dashboard → Settings → API. **Never expose client-side.** |
| `VEXNEXA_ADMIN_SECRET` | ✅ | Secret for admin bypass (`x-vexnexa-admin` header) and health endpoint (`x-admin-secret` header) |
| `CRON_SECRET` | Optional | Vercel Cron auth for the worker backup endpoint. Generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Base URL for canonical links (default: `https://scan.vexnexa.com`) |

---

## 4. Deploy

Push to `main` — Vercel auto-deploys.

---

## 5. Post-Deploy Health Check

### Schema check (lightweight, no Chromium)

```bash
curl -s https://scan.vexnexa.com/api/health/db \
  -H "x-admin-secret: YOUR_VEXNEXA_ADMIN_SECRET" | jq .
```

Expected response:
```json
{
  "ok": true,
  "tablesOk": true,
  "columnsOk": true,
  "missing": [],
  "tables": [ ... ],
  "ms": 150
}
```

If `ok: false`, the `missing` array tells you exactly what's wrong.

### Full health check (schema + Chromium)

```bash
curl -s https://scan.vexnexa.com/api/scan/health | jq .
```

This also launches Chromium to verify the scanner works.

---

## 6. Test a Scan

```bash
curl -s -X POST https://scan.vexnexa.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "example.com"}' | jq .
```

Then poll the job:
```bash
curl -s https://scan.vexnexa.com/api/scan/JOB_ID_HERE | jq .
```

The job should reach `completed` or `failed` status.

---

## 7. Later: Drop Legacy Columns

Once production is stable and you've confirmed no data depends on `_make_public_legacy`:

1. Take a backup of `scan_jobs`
2. Run `supabase/migrations/006_drop_legacy_columns.sql`
3. Verify with `VERIFY_PRODUCTION.sql` query #10

---

## Common Errors

### PGRST204: Could not find column 'X' of 'scan_jobs'

**Cause:** The DB schema is missing a column that the code writes to.

**Fix:** Run `005_canonical_schema.sql` in the SQL Editor. Then hit `/api/health/db` to verify.

### PGRST205: Could not find table 'scan_jobs'

**Cause:** The `scan_jobs` table doesn't exist yet.

**Fix:** Run `005_canonical_schema.sql`.

### PostgREST schema cache stale

**Cause:** Supabase caches the schema. After running migrations, the cache may be stale.

**Fix:** Go to **Supabase Dashboard → Settings → API → Reload schema cache** (or wait ~60 seconds for auto-refresh).

### Scan jobs stuck in 'queued' forever

**Cause:** This was a previous bug where scans depended on Vercel Cron. Now scans execute inline in the POST handler.

**Fix:** Deploy the latest code. Old stuck jobs will be cleaned up by the worker or expire after 15 minutes.

### Frontend polls endlessly

**Cause:** Previous bug — polling didn't stop on all terminal states.

**Fix:** Deploy the latest `DomainSearchBar.tsx` which stops on `completed`, `failed`, `rejected`, and `rate_limited`.
