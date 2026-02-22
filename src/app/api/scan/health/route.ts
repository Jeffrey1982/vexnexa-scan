import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/scan/health
 * Health probe: verify Chromium can launch and close on this serverless function.
 */
export async function GET(): Promise<NextResponse> {
  const t0 = Date.now();
  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    const { chromium: pwChromium } = await import('playwright-core');

    const executablePath: string = await chromium.executablePath();
    const args: string[] = chromium.args;

    if (!executablePath) {
      return NextResponse.json(
        {
          ok: false,
          error: 'executablePath is empty',
          hint: '@sparticuz/chromium could not find or inflate the Chromium binary.',
          ms: Date.now() - t0,
        },
        { status: 500 },
      );
    }

    // Try launching and immediately closing
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
      ms: Date.now() - t0,
    });
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    const stack: string = err instanceof Error ? (err.stack ?? '') : '';
    console.error('[/api/scan/health] error:', { message, stack });
    return NextResponse.json(
      {
        ok: false,
        error: message.substring(0, 500),
        stack: stack.substring(0, 2000),
        hint: 'Chromium failed to launch. Check that @sparticuz/chromium and playwright-core are compatible.',
        ms: Date.now() - t0,
      },
      { status: 500 },
    );
  }
}
