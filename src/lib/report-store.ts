// ─── In-Memory Report Store ───
// TODO: Replace all Maps/Sets with Firestore collections before production.
// This module is the single source of truth for report data.
// All page components and API routes should use these functions.

import type { ScanReport, ReportIssue, IssueBreakdown, ReportTotals } from './report-types';

// ─── In-memory stores ───
const reportsByDomain: Map<string, ScanReport> = new Map();
const reportsById: Map<string, ScanReport> = new Map();
const optedOutDomains: Set<string> = new Set();

// ─── Seed mock data so pages render without a scan ───
function seedMockReport(): void {
  const mockDomains: string[] = ['github.com', 'stripe.com', 'bbc.co.uk', 'shopify.com'];
  const mockScores: number[] = [82, 91, 74, 67];
  const mockTotalIssues: number[] = [14, 6, 23, 31];

  for (let i = 0; i < mockDomains.length; i++) {
    const domain: string = mockDomains[i];
    const score: number = mockScores[i];
    const totalIssues: number = mockTotalIssues[i];
    const now: string = new Date().toISOString();

    const report: ScanReport = {
      id: crypto.randomUUID(),
      domain,
      score,
      wcagLevel: '2.2 AA',
      is_public: true,
      private_token: crypto.randomUUID(),
      scope_pages: 1,
      last_scanned_at: now,
      created_at: now,
      totals: {
        totalIssues,
        contrastIssues: Math.round(totalIssues * 0.29),
        ariaIssues: Math.round(totalIssues * 0.25),
        altTextIssues: Math.round(totalIssues * 0.21),
      },
      issueBreakdown: {
        contrast: Math.round(totalIssues * 0.29),
        aria: Math.round(totalIssues * 0.25),
        altText: Math.round(totalIssues * 0.21),
        structure: Math.round(totalIssues * 0.14),
        forms: Math.round(totalIssues * 0.07),
        navigation: Math.max(1, Math.round(totalIssues * 0.04)),
      },
      issues: getMockIssues(),
    };

    reportsByDomain.set(domain, report);
    reportsById.set(report.id, report);
  }
}

function getMockIssues(): ReportIssue[] {
  return [
    {
      ruleName: 'color-contrast',
      impact: 'serious',
      wcagReference: 'WCAG 1.4.3',
      howToFix: 'Ensure the contrast ratio between foreground text and background colors meets the minimum 4.5:1 ratio for normal text and 3:1 for large text.',
      selector: '.hero-text > p',
      codeExample: '<!-- Before -->\n<p style="color: #999; background: #fff;">Low contrast</p>\n\n<!-- After -->\n<p style="color: #595959; background: #fff;">Accessible contrast</p>',
    },
    {
      ruleName: 'image-alt',
      impact: 'critical',
      wcagReference: 'WCAG 1.1.1',
      howToFix: 'Add descriptive alt text to all informative images. For decorative images, use an empty alt attribute (alt="").',
      selector: 'img.hero-image',
      codeExample: '<!-- Before -->\n<img src="hero.jpg" />\n\n<!-- After -->\n<img src="hero.jpg" alt="Team collaborating on accessibility audit" />',
    },
    {
      ruleName: 'aria-required-attr',
      impact: 'critical',
      wcagReference: 'WCAG 4.1.2',
      howToFix: 'Ensure all ARIA roles have their required attributes. For example, elements with role="checkbox" must include aria-checked.',
      selector: 'div[role="checkbox"]',
      codeExample: '<!-- Before -->\n<div role="checkbox">Accept terms</div>\n\n<!-- After -->\n<div role="checkbox" aria-checked="false" tabindex="0">Accept terms</div>',
    },
    {
      ruleName: 'heading-order',
      impact: 'moderate',
      wcagReference: 'WCAG 1.3.1',
      howToFix: 'Ensure heading levels increase by one and do not skip levels.',
      selector: 'main > h3',
      codeExample: '<!-- Before -->\n<h1>Page Title</h1>\n<h3>Subsection</h3>\n\n<!-- After -->\n<h1>Page Title</h1>\n<h2>Subsection</h2>',
    },
    {
      ruleName: 'label',
      impact: 'serious',
      wcagReference: 'WCAG 1.3.1',
      howToFix: 'Ensure every form input has an associated label element or an aria-label / aria-labelledby attribute.',
      selector: 'input[type="email"]',
      codeExample: '<!-- Before -->\n<input type="email" placeholder="Email" />\n\n<!-- After -->\n<label for="email">Email address</label>\n<input type="email" id="email" placeholder="Email" />',
    },
    {
      ruleName: 'link-name',
      impact: 'serious',
      wcagReference: 'WCAG 2.4.4',
      howToFix: 'Ensure all links have discernible text. If a link contains only an icon, add an aria-label.',
      selector: 'a.icon-link',
      codeExample: '<!-- Before -->\n<a href="/pricing"><svg>...</svg></a>\n\n<!-- After -->\n<a href="/pricing" aria-label="View pricing plans"><svg>...</svg></a>',
    },
  ];
}

// Seed on module load
seedMockReport();

// ─── Public API ───

export async function getReportByDomain(domain: string): Promise<ScanReport | null> {
  // TODO: Replace with Firestore query: where('domain', '==', domain)
  return reportsByDomain.get(domain) ?? null;
}

export async function getReportById(id: string): Promise<ScanReport | null> {
  // TODO: Replace with Firestore doc read
  return reportsById.get(id) ?? null;
}

export async function upsertReport(report: ScanReport): Promise<ScanReport> {
  // TODO: Replace with Firestore set/merge
  // Sanitize selectors to max 200 chars
  const sanitized: ScanReport = {
    ...report,
    issues: report.issues.map((issue) => ({
      ...issue,
      selector: issue.selector?.substring(0, 200),
      codeExample: issue.codeExample?.substring(0, 500),
    })),
  };

  reportsByDomain.set(sanitized.domain, sanitized);
  reportsById.set(sanitized.id, sanitized);
  return sanitized;
}

export async function setReportVisibility(
  id: string,
  isPublic: boolean,
): Promise<ScanReport | null> {
  // TODO: Replace with Firestore updateDoc
  const report: ScanReport | undefined = reportsById.get(id);
  if (!report) return null;

  const updated: ScanReport = { ...report, is_public: isPublic };
  reportsById.set(id, updated);
  reportsByDomain.set(updated.domain, updated);
  return updated;
}

export async function isDomainOptedOut(domain: string): Promise<boolean> {
  // TODO: Replace with Firestore query on opted_out_domains collection
  return optedOutDomains.has(domain);
}

export async function requestDomainRemoval(domain: string): Promise<void> {
  // TODO: Replace with Firestore write to opted_out_domains + update report
  optedOutDomains.add(domain);

  // Force any existing report to private
  const report: ScanReport | undefined = reportsByDomain.get(domain);
  if (report) {
    const updated: ScanReport = { ...report, is_public: false };
    reportsByDomain.set(domain, updated);
    reportsById.set(updated.id, updated);
  }
}

/**
 * Get all public, non-opted-out reports (for sitemap).
 * Limited to maxCount entries.
 */
export async function getPublicReports(maxCount: number = 5000): Promise<ScanReport[]> {
  // TODO: Replace with Firestore query: where('is_public', '==', true), limit(maxCount)
  const results: ScanReport[] = [];
  for (const report of reportsByDomain.values()) {
    if (report.is_public && !optedOutDomains.has(report.domain)) {
      results.push(report);
      if (results.length >= maxCount) break;
    }
  }
  return results;
}

/**
 * Create mock scan results for a domain.
 * TODO: Replace with actual scanning engine integration.
 */
export function generateMockScanResults(): {
  score: number;
  totals: ReportTotals;
  issueBreakdown: IssueBreakdown;
  issues: ReportIssue[];
} {
  const totalIssues: number = Math.floor(Math.random() * 30) + 5;
  return {
    score: Math.max(20, Math.min(98, 100 - totalIssues * 2)),
    totals: {
      totalIssues,
      contrastIssues: Math.round(totalIssues * 0.29),
      ariaIssues: Math.round(totalIssues * 0.25),
      altTextIssues: Math.round(totalIssues * 0.21),
    },
    issueBreakdown: {
      contrast: Math.round(totalIssues * 0.29),
      aria: Math.round(totalIssues * 0.25),
      altText: Math.round(totalIssues * 0.21),
      structure: Math.round(totalIssues * 0.14),
      forms: Math.round(totalIssues * 0.07),
      navigation: Math.max(1, Math.round(totalIssues * 0.04)),
    },
    issues: getMockIssues(),
  };
}
