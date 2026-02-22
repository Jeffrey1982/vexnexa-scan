import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProbeResult {
  status: number | null;
  contentType: string | null;
  bodySnippet: string;
  error?: string;
}

async function probe(url: string, key: string): Promise<ProbeResult> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    });
    const body: string = await res.text();
    return {
      status: res.status,
      contentType: res.headers.get('content-type'),
      bodySnippet: body.substring(0, 200),
    };
  } catch (err) {
    return {
      status: null,
      contentType: null,
      bodySnippet: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function parseHost(raw: string): string | null {
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}

/**
 * GET /api/supabase/health
 * Deep diagnostics for Supabase connectivity — no secrets exposed.
 */
export async function GET(): Promise<NextResponse> {
  const supabaseUrl: string = process.env.SUPABASE_URL ?? '';
  const serviceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  // ─── 1. Environment diagnostics ───
  const supabaseUrlPresent: boolean = supabaseUrl.length > 0;
  const supabaseUrlHost: string | null = supabaseUrlPresent ? parseHost(supabaseUrl) : null;
  const keyPresent: boolean = serviceKey.length > 0;
  const keyPrefix: string = keyPresent ? serviceKey.substring(0, 10) : '';

  const env = { supabaseUrlPresent, supabaseUrlHost, keyPresent, keyPrefix };

  // ─── Validate URL shape ───
  if (!supabaseUrlPresent || !supabaseUrlHost) {
    return NextResponse.json({
      ok: false,
      env,
      hint: 'SUPABASE_URL is missing or not a valid URL. Expected https://<ref>.supabase.co',
    });
  }

  if (!supabaseUrlHost.endsWith('.supabase.co')) {
    return NextResponse.json({
      ok: false,
      env,
      hint: `SUPABASE_URL host "${supabaseUrlHost}" does not end with .supabase.co — is this correct?`,
    });
  }

  if (!keyPresent) {
    return NextResponse.json({
      ok: false,
      env,
      hint: 'SUPABASE_SERVICE_ROLE_KEY is missing. Set it in Vercel env vars (Dashboard → Settings → API → service_role).',
    });
  }

  // ─── 2A. REST base probe ───
  const restProbe: ProbeResult = await probe(`${supabaseUrl}/rest/v1/`, serviceKey);

  // ─── 2B. Table probe ───
  const tableProbe: ProbeResult = await probe(
    `${supabaseUrl}/rest/v1/scan_reports?select=id&limit=1`,
    serviceKey,
  );

  // ─── 3. Determine overall health ───
  const restOk: boolean = restProbe.status === 200;
  const tableOk: boolean = tableProbe.status === 200;
  const ok: boolean = restOk && tableOk;

  let hint: string = '';
  if (!restOk) {
    hint = `REST base returned status ${restProbe.status ?? 'null'}. `;
    if (restProbe.error) hint += `Fetch error: ${restProbe.error}. `;
    hint += 'Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (must be service_role, not anon key).';
  } else if (!tableOk) {
    const isMissing: boolean =
      tableProbe.bodySnippet.includes('relation') ||
      tableProbe.bodySnippet.includes('does not exist');
    hint = isMissing
      ? 'scan_reports table does not exist. Run supabase/migrations/001_scan_reports.sql in the Supabase SQL Editor.'
      : `Table probe returned status ${tableProbe.status}. Body: ${tableProbe.bodySnippet}`;
  } else {
    hint = 'Supabase connection healthy. scan_reports table exists.';
  }

  return NextResponse.json({ ok, env, restProbe, tableProbe, hint }, { status: ok ? 200 : 500 });
}
