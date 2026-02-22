import { NextRequest, NextResponse } from 'next/server';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';
import { requestDomainRemoval } from '@/lib/report-store';

interface RemovalRequestBody {
  domain: string;
  email: string;
  reason?: string;
}

/**
 * POST /api/report-removal
 * Request removal of a public report for a domain.
 *
 * In production this should:
 *  1. Validate domain ownership (DNS TXT record or email to admin@domain)
 *  2. Log the removal request for audit
 *  3. Send confirmation email
 *
 * For MVP: immediately opts out the domain and sets existing report to private.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RemovalRequestBody = await request.json();

    if (!body.domain || typeof body.domain !== 'string') {
      return NextResponse.json(
        { error: 'domain is required' },
        { status: 400 },
      );
    }

    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 },
      );
    }

    let domain: string;
    try {
      domain = normalizeDomain(body.domain);
    } catch (e) {
      if (e instanceof DomainValidationError) {
        return NextResponse.json(
          { error: e.message },
          { status: 400 },
        );
      }
      throw e;
    }

    // TODO: In production, validate domain ownership before processing
    // TODO: Log removal request to audit collection in Firestore
    // TODO: Send confirmation email to body.email

    await requestDomainRemoval(domain);

    return NextResponse.json({
      ok: true,
      domain,
      message: 'Removal request received. The report has been set to private.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process removal request' },
      { status: 500 },
    );
  }
}
