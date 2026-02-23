import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tables the application requires */
const REQUIRED_TABLES: string[] = [
  'scan_jobs',
  'scan_reports',
  'scan_opt_outs',
  'report_views',
];

/** Required columns per table — source of truth from TypeScript types */
const REQUIRED_COLUMNS: Record<string, string[]> = {
  scan_jobs: [
    'id', 'domain', 'scan_url', 'status', 'created_at',
    'started_at', 'completed_at', 'expires_at', 'ip',
    'is_admin', 'duration_ms', 'error', 'result_json',
  ],
  scan_reports: [
    'id', 'domain', 'private_token', 'is_public', 'scope_pages',
    'score', 'wcag_level', 'data', 'created_at', 'last_scanned_at', 'opted_out',
  ],
  scan_opt_outs: ['domain', 'created_at'],
  report_views: ['id', 'domain', 'viewed_at', 'referrer', 'user_agent'],
};

interface TableCheck {
  table: string;
  exists: boolean;
  columns?: string[];
  missing?: string[];
}

/**
 * GET /api/health/db
 * Protected schema sanity check. Verifies all tables and columns exist.
 * Requires header: x-admin-secret = VEXNEXA_ADMIN_SECRET
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // ─── Auth ───
  const secret: string | null = request.headers.get('x-admin-secret');
  const expected: string = process.env.VEXNEXA_ADMIN_SECRET ?? '';

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const t0: number = Date.now();
  const sb = getSupabaseServer();
  const tableChecks: TableCheck[] = [];
  let allTablesOk: boolean = true;
  let allColumnsOk: boolean = true;
  const allMissing: string[] = [];

  for (const table of REQUIRED_TABLES) {
    // Probe the table with a zero-row select
    const { error: tableErr } = await sb.from(table).select('*').limit(0);

    if (tableErr) {
      tableChecks.push({ table, exists: false });
      allTablesOk = false;
      allMissing.push(`table:${table}`);
      continue;
    }

    // Probe each required column
    const requiredCols: string[] = REQUIRED_COLUMNS[table] ?? [];
    const present: string[] = [];
    const missing: string[] = [];

    for (const col of requiredCols) {
      const { error: colErr } = await sb.from(table).select(col).limit(0);
      if (colErr) {
        missing.push(col);
      } else {
        present.push(col);
      }
    }

    if (missing.length > 0) {
      allColumnsOk = false;
      for (const m of missing) {
        allMissing.push(`${table}.${m}`);
      }
    }

    tableChecks.push({
      table,
      exists: true,
      columns: present,
      missing: missing.length > 0 ? missing : undefined,
    });
  }

  const ok: boolean = allTablesOk && allColumnsOk;

  return NextResponse.json(
    {
      ok,
      tablesOk: allTablesOk,
      columnsOk: allColumnsOk,
      missing: allMissing.length > 0 ? allMissing : [],
      tables: tableChecks,
      hint: ok
        ? undefined
        : 'Run supabase/migrations/005_canonical_schema.sql in the Supabase SQL Editor.',
      ms: Date.now() - t0,
    },
    { status: ok ? 200 : 500 },
  );
}
