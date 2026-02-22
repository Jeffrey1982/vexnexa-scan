import type { IssueImpact } from '@/lib/report-types';

// ─── Types ───

export interface ScanInput {
  url: string;
  domain: string;
}

export interface AxeDerivedIssue {
  ruleName: string;
  impact: IssueImpact;
  wcagReference: string;
  howToFix: string;
  codeExample?: string;
  selectors?: string[];
}

export interface AxeDerivedResult {
  score: number;
  wcagLevel: string;
  totals: {
    totalIssues: number;
    contrastIssues: number;
    ariaIssues: number;
    altTextIssues: number;
  };
  issueBreakdown: Record<string, number>;
  issues: AxeDerivedIssue[];
  engine: { axeVersion: string };
  timings: { totalMs: number; navMs?: number; axeMs?: number };
}

// ─── Axe violation shape (minimal typing for what we use) ───

interface AxeViolationNode {
  target: (string | string[])[];
}

interface AxeViolation {
  id: string;
  impact?: string;
  tags: string[];
  description: string;
  nodes: AxeViolationNode[];
}

interface AxeRunResult {
  violations: AxeViolation[];
  testEngine?: { version?: string };
}

// ─── Constants ───

const NAV_TIMEOUT_MS = 20_000;
const SCAN_TIMEOUT_MS = 45_000;
const HYDRATION_DELAY_MS = 800;
const MAX_SELECTORS_PER_ISSUE = 5;
const MAX_SELECTOR_LENGTH = 200;
const BLOCKED_RESOURCE_TYPES = ['image', 'media', 'font'];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VexNexaScanner/1.0';

// ─── WCAG tag parser ───

function parseWcagTag(tag: string): string | null {
  // e.g. 'wcag143' => 'WCAG 1.4.3', 'wcag21a' => null (level tag, not criterion)
  const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
  if (match) {
    return `WCAG ${match[1]}.${match[2]}.${match[3]}`;
  }
  return null;
}

function extractWcagReference(tags: string[]): string {
  for (const tag of tags) {
    const ref = parseWcagTag(tag);
    if (ref) return ref;
  }
  // Fallback: check for level tags
  if (tags.includes('wcag2aa') || tags.includes('wcag21aa') || tags.includes('wcag22aa')) {
    return 'WCAG 2.x AA';
  }
  if (tags.includes('wcag2a') || tags.includes('wcag21a')) {
    return 'WCAG 2.x A';
  }
  if (tags.includes('best-practice')) {
    return 'Best Practice';
  }
  return 'WCAG';
}

// ─── Curated fix guidance for common rules ───

interface RuleGuidance {
  howToFix: string;
  codeExample: string;
}

const RULE_GUIDANCE: Record<string, RuleGuidance> = {
  'color-contrast': {
    howToFix:
      'Ensure the contrast ratio between foreground text and background colors meets the minimum 4.5:1 ratio for normal text and 3:1 for large text.',
    codeExample:
      '<!-- Before -->\n<p style="color: #999; background: #fff;">Low contrast</p>\n\n<!-- After -->\n<p style="color: #595959; background: #fff;">Accessible contrast</p>',
  },
  'image-alt': {
    howToFix:
      'Add descriptive alt text to all informative images. For decorative images, use an empty alt attribute (alt="").',
    codeExample:
      '<!-- Before -->\n<img src="photo.jpg" />\n\n<!-- After -->\n<img src="photo.jpg" alt="Description of the image content" />',
  },
  label: {
    howToFix:
      'Ensure every form input has an associated <label> element or an aria-label / aria-labelledby attribute.',
    codeExample:
      '<!-- Before -->\n<input type="email" placeholder="Email" />\n\n<!-- After -->\n<label for="email">Email</label>\n<input type="email" id="email" />',
  },
  'link-name': {
    howToFix:
      'Ensure all links have discernible text. If a link contains only an icon, add an aria-label.',
    codeExample:
      '<!-- Before -->\n<a href="/page"><svg>...</svg></a>\n\n<!-- After -->\n<a href="/page" aria-label="Go to page"><svg>...</svg></a>',
  },
  'aria-required-attr': {
    howToFix:
      'Ensure all ARIA roles have their required attributes. For example, role="checkbox" requires aria-checked.',
    codeExample:
      '<!-- Before -->\n<div role="checkbox">Option</div>\n\n<!-- After -->\n<div role="checkbox" aria-checked="false" tabindex="0">Option</div>',
  },
  'aria-roles': {
    howToFix:
      'Ensure all role attribute values are valid ARIA roles. Remove or correct invalid role values.',
    codeExample:
      '<!-- Before -->\n<div role="invalid">Content</div>\n\n<!-- After -->\n<div role="region" aria-label="Content section">Content</div>',
  },
  'aria-valid-attr': {
    howToFix:
      'Ensure all aria-* attributes are valid and correctly spelled.',
    codeExample:
      '<!-- Before -->\n<div aria-labelled="title">...</div>\n\n<!-- After -->\n<div aria-labelledby="title">...</div>',
  },
  'heading-order': {
    howToFix:
      'Ensure heading levels increase by one and do not skip levels (e.g. h1 followed by h2, not h3).',
    codeExample:
      '<!-- Before -->\n<h1>Title</h1>\n<h3>Subsection</h3>\n\n<!-- After -->\n<h1>Title</h1>\n<h2>Subsection</h2>',
  },
  'html-has-lang': {
    howToFix:
      'Add a lang attribute to the <html> element to declare the page language.',
    codeExample:
      '<!-- Before -->\n<html>\n\n<!-- After -->\n<html lang="en">',
  },
  'document-title': {
    howToFix:
      'Ensure the page has a <title> element inside <head> that describes the page content.',
    codeExample:
      '<!-- Before -->\n<head></head>\n\n<!-- After -->\n<head><title>Page Title</title></head>',
  },
  'meta-viewport': {
    howToFix:
      'Ensure the meta viewport element does not disable user scaling (maximum-scale should be >= 2 or not set).',
    codeExample:
      '<!-- Before -->\n<meta name="viewport" content="width=device-width, maximum-scale=1">\n\n<!-- After -->\n<meta name="viewport" content="width=device-width, initial-scale=1">',
  },
  'button-name': {
    howToFix:
      'Ensure all buttons have discernible text. Add visible text or an aria-label.',
    codeExample:
      '<!-- Before -->\n<button><svg>...</svg></button>\n\n<!-- After -->\n<button aria-label="Close menu"><svg>...</svg></button>',
  },
};

const DEFAULT_GUIDANCE: RuleGuidance = {
  howToFix:
    'Review this rule in WCAG guidance and ensure elements meet the requirement.',
  codeExample: '',
};

// ─── Selector sanitization ───

function sanitizeSelector(raw: string): string {
  // Strip very long attribute values, cap total length
  let s = raw.replace(/\[([^\]]{60,})\]/g, '[...]');
  if (s.length > MAX_SELECTOR_LENGTH) {
    s = s.substring(0, MAX_SELECTOR_LENGTH - 3) + '...';
  }
  return s;
}

function extractSelectors(nodes: AxeViolationNode[]): string[] {
  const selectors: string[] = [];
  for (const node of nodes) {
    if (selectors.length >= MAX_SELECTORS_PER_ISSUE) break;
    if (node.target && node.target.length > 0) {
      const raw = Array.isArray(node.target[0])
        ? node.target[0].join(' ')
        : String(node.target[0]);
      selectors.push(sanitizeSelector(raw));
    }
  }
  return selectors;
}

// ─── Score computation ───

function computeScore(issues: AxeDerivedIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    switch (issue.impact) {
      case 'critical':
        score -= 8;
        break;
      case 'serious':
        score -= 5;
        break;
      case 'moderate':
        score -= 3;
        break;
      case 'minor':
        score -= 1;
        break;
    }
  }
  return Math.max(0, Math.min(100, score));
}

// ─── Issue categorization ───

const ALT_TEXT_RULES = new Set(['image-alt', 'input-image-alt', 'area-alt']);

function categorizeIssues(issues: AxeDerivedIssue[]): {
  totals: AxeDerivedResult['totals'];
  issueBreakdown: Record<string, number>;
} {
  let contrastIssues = 0;
  let ariaIssues = 0;
  let altTextIssues = 0;
  let structureIssues = 0;
  let formIssues = 0;
  let navigationIssues = 0;

  for (const issue of issues) {
    const rule = issue.ruleName;
    if (rule === 'color-contrast' || rule.includes('contrast')) {
      contrastIssues++;
    } else if (rule.startsWith('aria-') || rule.includes('aria')) {
      ariaIssues++;
    } else if (ALT_TEXT_RULES.has(rule)) {
      altTextIssues++;
    } else if (rule === 'heading-order' || rule === 'document-title' || rule === 'html-has-lang' || rule === 'landmark-one-main') {
      structureIssues++;
    } else if (rule === 'label' || rule === 'button-name' || rule === 'select-name') {
      formIssues++;
    } else if (rule === 'link-name' || rule.includes('link') || rule.includes('tabindex')) {
      navigationIssues++;
    } else {
      structureIssues++;
    }
  }

  return {
    totals: {
      totalIssues: issues.length,
      contrastIssues,
      ariaIssues,
      altTextIssues,
    },
    issueBreakdown: {
      contrast: contrastIssues,
      aria: ariaIssues,
      altText: altTextIssues,
      structure: structureIssues,
      forms: formIssues,
      navigation: navigationIssues,
    },
  };
}

// ─── Transform axe violations to derived issues ───

function transformViolations(violations: AxeViolation[]): AxeDerivedIssue[] {
  return violations.map((v): AxeDerivedIssue => {
    const impact = (v.impact as IssueImpact) || 'moderate';
    const guidance = RULE_GUIDANCE[v.id] || DEFAULT_GUIDANCE;
    const selectors = extractSelectors(v.nodes);

    return {
      ruleName: v.id,
      impact,
      wcagReference: extractWcagReference(v.tags),
      howToFix: guidance.howToFix,
      codeExample: guidance.codeExample || undefined,
      selectors: selectors.length > 0 ? selectors : undefined,
    };
  });
}

// ─── Main scan function ───

export class ScanError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 502,
  ) {
    super(message);
    this.name = 'ScanError';
  }
}

export async function runAxeScan(input: ScanInput): Promise<AxeDerivedResult> {
  const startTime = Date.now();

  // Dynamic imports — keeps these out of the webpack bundle
  const chromium = (await import('@sparticuz/chromium')).default;
  const { chromium: pwChromium } = await import('playwright-core');

  // ─── Resolve axe-core source robustly ───
  const axeModule = await import('axe-core');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axeAny = axeModule as any;
  const axeSource: string | undefined =
    axeAny.source ?? axeAny.default?.source;
  if (typeof axeSource !== 'string' || axeSource.length < 1000) {
    throw new ScanError(
      `axeSource invalid (type=${typeof axeSource}, len=${(axeSource as string | undefined)?.length ?? 'n/a'}). Check axe-core import.`,
      500,
    );
  }
  console.log('[scanner] axe-core source resolved, length:', axeSource.length);

  // ─── Resolve Chromium binary ───
  const executablePath: string = await chromium.executablePath();
  if (!executablePath) {
    throw new ScanError(
      'Chromium executablePath() returned empty — binary not found in serverless environment.',
      500,
    );
  }
  console.log('[scanner] executablePath:', executablePath);
  console.log('[scanner] chromium.args count:', chromium.args.length);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any = null;

  try {
    // ─── Launch browser via playwright-core + @sparticuz/chromium ───
    browser = await pwChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
    console.log('[scanner] browser launched');

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: USER_AGENT,
    });
    const page = await context.newPage();

    // ─── Stage 1: Inject axe-core BEFORE navigation via addInitScript ───
    await page.addInitScript({ content: axeSource });
    console.log('[scanner] stage1: axe injected via addInitScript');

    // ─── Resource blocking (allow document, script, xhr, fetch, stylesheet) ───
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.route('**/*', (route: any) => {
      const resourceType: string = route.request().resourceType();
      if (BLOCKED_RESOURCE_TYPES.includes(resourceType)) {
        return route.abort();
      }
      return route.continue();
    });

    // ─── Navigate ───
    const navStart = Date.now();
    try {
      await page.goto(input.url, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
    } catch (navError) {
      const msg = navError instanceof Error ? navError.message : String(navError);
      throw new ScanError(
        `Could not load ${input.domain}: ${msg.substring(0, 200)}`,
        502,
      );
    }
    const navMs = Date.now() - navStart;
    console.log('[scanner] navigated in', navMs, 'ms');

    // ─── Hydration wait ───
    await new Promise((resolve) => setTimeout(resolve, HYDRATION_DELAY_MS));

    // ─── Check overall timeout ───
    if (Date.now() - startTime > SCAN_TIMEOUT_MS) {
      throw new ScanError('Scan timed out during page load.', 504);
    }

    // ─── Stage 2: addScriptTag fallback after navigation ───
    let scriptTagError: string | null = null;
    try {
      await page.addScriptTag({ content: axeSource });
      console.log('[scanner] stage2: axe injected via addScriptTag');
    } catch (e) {
      scriptTagError = e instanceof Error ? e.message : String(e);
      console.log('[scanner] stage2: addScriptTag failed (non-fatal):', scriptTagError);
    }

    // ─── Check 1: Is axe present? ───
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let axePresent: boolean = await page.evaluate(() => {
      const w = window as any;
      return !!(w.axe && typeof w.axe.run === 'function');
    });
    console.log('[scanner] check1: axePresent =', axePresent);

    // ─── Stage 3: eval() fallback if still missing ───
    if (!axePresent) {
      console.log('[scanner] stage3: attempting eval() injection');
      try {
        await page.evaluate((src: string) => {
          (0, eval)(src);
        }, axeSource);
        console.log('[scanner] stage3: eval() injection done');
      } catch (e) {
        const evalErr = e instanceof Error ? e.message : String(e);
        console.error('[scanner] stage3: eval() injection failed:', evalErr);
      }

      // ─── Re-check after eval fallback ───
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      axePresent = await page.evaluate(() => {
        const w = window as any;
        return !!(w.axe && typeof w.axe.run === 'function');
      });
      console.log('[scanner] check2: axePresent =', axePresent);
    }

    // ─── Final failure: collect diagnostics ───
    if (!axePresent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diag = await page.evaluate(() => {
        const w = window as any;
        return {
          readyState: document.readyState,
          csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || null,
          hasAxeObj: typeof w.axe,
          hasAxeRun: typeof w.axe?.run,
        };
      });
      console.error('[scanner] axe injection failed — diagnostics:', JSON.stringify(diag));

      throw new ScanError(
        `Axe injection failed after init+scriptTag+eval fallback. Likely CSP/TrustedTypes/isolated world issue. ` +
        `url=${input.url}, readyState=${diag.readyState}, csp=${diag.csp ? diag.csp.substring(0, 200) : 'none'}, ` +
        `scriptTagErr=${scriptTagError ?? 'none'}, hasAxeObj=${diag.hasAxeObj}, hasAxeRun=${diag.hasAxeRun}`,
        500,
      );
    }

    // ─── Run axe ───
    const axeStart = Date.now();
    const axeResult: AxeRunResult = await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axe = (window as any).axe;
      return await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: [
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'wcag22aa',
            'best-practice',
          ],
        },
        resultTypes: ['violations'],
      });
    });
    const axeMs = Date.now() - axeStart;
    console.log('[scanner] axe ran in', axeMs, 'ms, violations:', axeResult.violations.length);

    // ─── Transform results ───
    const issues = transformViolations(axeResult.violations);
    const score = computeScore(issues);
    const { totals, issueBreakdown } = categorizeIssues(issues);
    const totalMs = Date.now() - startTime;

    const axeVersion = axeResult.testEngine?.version || 'unknown';

    return {
      score,
      wcagLevel: '2.2 AA',
      totals,
      issueBreakdown,
      issues,
      engine: { axeVersion },
      timings: { totalMs, navMs, axeMs },
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
      console.log('[scanner] browser closed');
    }
  }
}
