// ─── Report Data Types ───
// Only derived metrics are stored. No full HTML, no innerText.
// Evidence is limited to CSS selectors and WCAG rule references.

export type IssueImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface ReportIssue {
  ruleName: string;
  impact: IssueImpact;
  wcagReference: string;
  howToFix: string;
  /** CSS selector of the offending element — no innerText stored */
  selector?: string;
  /** Code example showing before/after fix */
  codeExample?: string;
}

export interface IssueBreakdown {
  contrast: number;
  aria: number;
  altText: number;
  structure: number;
  forms: number;
  navigation: number;
}

export interface ReportTotals {
  totalIssues: number;
  contrastIssues: number;
  ariaIssues: number;
  altTextIssues: number;
}

export interface ScanReport {
  /** Unique report ID (used for private token-based URLs) */
  id: string;
  /** The scanned domain */
  domain: string;
  /** Accessibility score 0-100 */
  score: number;
  /** WCAG conformance level tested against */
  wcagLevel: string;
  /** Whether the report is publicly indexable */
  is_public: boolean;
  /** Private access token (for /r/[id] route) */
  private_token: string;
  /** Number of pages in scan scope */
  scope_pages: number;
  /** ISO timestamp of when the scan was performed */
  last_scanned_at: string;
  /** ISO timestamp of when the report record was created */
  created_at: string;

  totals: ReportTotals;
  issueBreakdown: IssueBreakdown;
  issues: ReportIssue[];
}

/**
 * Generate a random token for private report URLs.
 * In production, use crypto.randomUUID() or a secure random generator.
 */
export function generatePrivateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * Create a new ScanReport with sensible defaults.
 * In production, this would be persisted to Firestore.
 */
export function createReportRecord(
  domain: string,
  score: number,
  totals: ReportTotals,
  issueBreakdown: IssueBreakdown,
  issues: ReportIssue[],
  isPublic: boolean = false,
): ScanReport {
  const now = new Date().toISOString();
  return {
    id: generatePrivateToken(),
    domain,
    score,
    wcagLevel: '2.2 AA',
    is_public: isPublic,
    private_token: generatePrivateToken(),
    scope_pages: 1,
    last_scanned_at: now,
    created_at: now,
    totals,
    issueBreakdown,
    issues,
  };
}
