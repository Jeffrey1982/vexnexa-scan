import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ─── Required columns in scan_jobs ───
const REQUIRED_SCAN_JOBS_COLUMNS: string[] = [
  'id', 'domain', 'scan_url', 'status', 'created_at',
  'started_at', 'completed_at', 'expires_at', 'ip',
  'is_admin', 'duration_ms', 'error', 'result_json',
];

/**
 * Verify that the scan_jobs table exists and has all required columns.
 * Returns { ok, columns, missing } or { ok: false, error }.
 */
async function checkScanJobsSchema(): Promise<{
  ok: boolean;
  columns?: string[];
  missing?: string[];
  error?: string;
}> {
  try {
    const sb = getSupabaseServer();

    // Fetch one row (or zero) to introspect columns via the response shape
    const { error } = await sb
      .from('scan_jobs')
      .select('*')
      .limit(0);

    if (error) {
      return { ok: false, error: `Supabase query failed: ${error.message} (${error.code})` };
    }

    // If the table exists but is empty, data is []. We can also probe columns
    // by attempting a filtered select of each required column.
    const columnChecks: Array<{ col: string; exists: boolean }> = [];

    for (const col of REQUIRED_SCAN_JOBS_COLUMNS) {
      const probe = await sb
        .from('scan_jobs')
        .select(col)
        .limit(0);

      columnChecks.push({ col, exists: !probe.error });
    }

    const presentCols: string[] = columnChecks.filter((c) => c.exists).map((c) => c.col);
    const missingCols: string[] = columnChecks.filter((c) => !c.exists).map((c) => c.col);

    return {
      ok: missingCols.length === 0,
      columns: presentCols,
      missing: missingCols.length > 0 ? missingCols : undefined,
    };
  } catch (err) {
    const msg: string = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

/**
 * GET /api/scan/health
 * Health probe: verify Chromium + Supabase scan_jobs schema.
 */
export async function GET(): Promise<NextResponse> {
  const t0 = Date.now();

  // ─── 1. Supabase schema check ───
  const schema = await checkScanJobsSchema();
  if (!schema.ok) {
    console.error('[/api/scan/health] scan_jobs schema check failed:', schema);
    return NextResponse.json(
      {
        ok: false,
        check: 'scan_jobs_schema',
        columns: schema.columns,
        missing: schema.missing,
        error: schema.error,
        hint: 'Run supabase/migrations/003_scan_jobs.sql and 004_drop_make_public_from_scan_jobs.sql in the Supabase SQL Editor.',
        ms: Date.now() - t0,
      },
      { status: 500 },
    );
  }

  // ─── 2. Chromium launch check ───
  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    const { chromium: pwChromium } = await import('playwright-core');

    const executablePath: string = await chromium.executablePath();
    const args: string[] = chromium.args;

    if (!executablePath) {
      return NextResponse.json(
        {
          ok: false,
          check: 'chromium',
          error: 'executablePath is empty',
          hint: '@sparticuz/chromium could not find or inflate the Chromium binary.',
          scanJobsSchema: schema,
          ms: Date.now() - t0,
        },
        { status: 500 },
      );
    }

    const browser = await pwChromium.launch({
      args,
      executablePath,
      headless: true,
    });
    const version: string = browser.version();
    await browser.close();

    return NextResponse.json({
      ok: true,
      chromiumPath: executablePath,
      browserVersion: version,
      headless: true,
      argsCount: args.length,
      scanJobsSchema: schema,
      ms: Date.now() - t0,
    });
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    const stack: string = err instanceof Error ? (err.stack ?? '') : '';
    console.error('[/api/scan/health] error:', { message, stack });
    return NextResponse.json(
      {
        ok: false,
        check: 'chromium',
        error: message.substring(0, 500),
        stack: stack.substring(0, 2000),
        hint: 'Chromium failed to launch. Check that @sparticuz/chromium and playwright-core are compatible.',
        scanJobsSchema: schema,
        ms: Date.now() - t0,
      },
      { status: 500 },
    );
  }
}
