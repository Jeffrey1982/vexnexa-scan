import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ViewRequestBody {
  domain: string;
}

/**
 * POST /api/report/view
 * Lightweight view tracking for report pages.
 * Stores domain, timestamp, referrer, and user-agent in Supabase.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ViewRequestBody = await request.json();

    if (!body.domain || typeof body.domain !== 'string') {
      return NextResponse.json({ error: 'domain is required' }, { status: 400 });
    }

    const domain: string = body.domain.trim().toLowerCase().substring(0, 253);
    const referrer: string | null = request.headers.get('referer') ?? request.headers.get('referrer');
    const userAgent: string | null = request.headers.get('user-agent');

    const sb = getSupabaseServer();

    await sb.from('report_views').insert({
      domain,
      referrer: referrer?.substring(0, 2000) ?? null,
      user_agent: userAgent?.substring(0, 500) ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg: string = err instanceof Error ? err.message : String(err);
    console.error('[/api/report/view] Error:', msg);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
