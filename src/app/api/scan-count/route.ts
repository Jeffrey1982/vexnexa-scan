import { NextResponse } from 'next/server';
import { getScanCountLast24h } from '@/lib/report-store';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<{ count: number }>> {
  const count: number = await getScanCountLast24h();

  return NextResponse.json(
    { count },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=120',
      },
    },
  );
}
