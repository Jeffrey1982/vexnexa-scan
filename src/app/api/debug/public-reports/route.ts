import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface DebugResponse {
  ok: boolean;
  totalCount: number;
  publicCount: number;
  samplePublic: {
    id: string;
    domain: string;
    score: number;
    is_public: boolean;
    created_at: string;
    totals: unknown;
  }[];
  env: {
    hasUrl: boolean;
    hasServiceKey: boolean;
  };
  error?: string;
}

export async function GET(): Promise<NextResponse<DebugResponse>> {
  const env = {
    hasUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!env.hasUrl || !env.hasServiceKey) {
    return NextResponse.json({
      ok: false,
      totalCount: 0,
      publicCount: 0,
      samplePublic: [],
      env,
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
    });
  }

  try {
    const sb = getSupabaseServer();

    // Total count
    const { count: totalCount, error: totalErr } = await sb
      .from('scan_reports')
      .select('id', { count: 'exact', head: true });

    if (totalErr) {
      return NextResponse.json({
        ok: false,
        totalCount: 0,
        publicCount: 0,
        samplePublic: [],
        env,
        error: `Total count query failed: ${JSON.stringify(totalErr)}`,
      });
    }

    // Public count
    const { count: publicCount, error: publicErr } = await sb
      .from('scan_reports')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true);

    if (publicErr) {
      return NextResponse.json({
        ok: false,
        totalCount: totalCount ?? 0,
        publicCount: 0,
        samplePublic: [],
        env,
        error: `Public count query failed: ${JSON.stringify(publicErr)}`,
      });
    }

    // Sample public reports
    const { data: sampleData, error: sampleErr } = await sb
      .from('scan_reports')
      .select('id, domain, score, is_public, created_at, data')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(12);

    if (sampleErr) {
      return NextResponse.json({
        ok: false,
        totalCount: totalCount ?? 0,
        publicCount: publicCount ?? 0,
        samplePublic: [],
        env,
        error: `Sample query failed: ${JSON.stringify(sampleErr)}`,
      });
    }

    const samplePublic = (sampleData ?? []).map((row: Record<string, unknown>) => {
      const data = row.data as Record<string, unknown> | null;
      return {
        id: row.id as string,
        domain: row.domain as string,
        score: row.score as number,
        is_public: row.is_public as boolean,
        created_at: row.created_at as string,
        totals: data?.totals ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      totalCount: totalCount ?? 0,
      publicCount: publicCount ?? 0,
      samplePublic,
      env,
    });
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      totalCount: 0,
      publicCount: 0,
      samplePublic: [],
      env,
      error: `Unexpected error: ${message}`,
    });
  }
}
