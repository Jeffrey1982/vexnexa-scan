import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import type { AxeResults, Result } from 'axe-core';

export interface ScanResult {
  success: boolean;
  score: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  highlights: Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
  }>;
  scannedUrl: string;
  error?: string;
}

interface ViolationsByImpact {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

const SCAN_TIMEOUT = 30000; // 30 seconds
const MAX_HIGHLIGHTS = 3;

async function getBrowser(): Promise<Browser> {
  if (process.env.NODE_ENV === 'production') {
    // Vercel production environment
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // Local development - requires Chrome/Chromium installed
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome',
    });
  }
}

function calculateScore(violations: ViolationsByImpact, totalViolations: number): number {
  if (totalViolations === 0) return 100;

  // Weighted scoring: critical issues have more impact
  const weightedScore =
    violations.critical * 10 +
    violations.serious * 5 +
    violations.moderate * 2 +
    violations.minor * 1;

  // Normalize to 0-100 scale (inverse relationship)
  const score = Math.max(0, Math.min(100, 100 - weightedScore));
  return Math.round(score);
}

function countViolationsByImpact(violations: Result[]): ViolationsByImpact {
  const counts: ViolationsByImpact = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  violations.forEach((violation) => {
    const impact = violation.impact as keyof ViolationsByImpact | undefined;
    if (impact && impact in counts) {
      counts[impact] += violation.nodes.length;
    }
  });

  return counts;
}

function extractHighlights(violations: Result[]): ScanResult['highlights'] {
  // Sort by impact severity
  const impactOrder: Record<string, number> = {
    critical: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
  };

  const sorted = [...violations].sort((a, b) => {
    const impactA = impactOrder[a.impact || 'minor'] ?? 4;
    const impactB = impactOrder[b.impact || 'minor'] ?? 4;
    if (impactA !== impactB) return impactA - impactB;
    // Secondary sort by number of occurrences
    return b.nodes.length - a.nodes.length;
  });

  return sorted.slice(0, MAX_HIGHLIGHTS).map((violation) => ({
    id: violation.id,
    impact: violation.impact || 'moderate',
    description: violation.description,
    helpUrl: violation.helpUrl,
  }));
}

async function runAxeScan(page: Page): Promise<AxeResults> {
  // Inject axe-core into the page
  await page.addScriptTag({
    path: require.resolve('axe-core'),
  });

  // Run axe scan
  const results = await page.evaluate(() => {
    return new Promise<AxeResults>((resolve, reject) => {
      // @ts-expect-error - axe is injected globally
      if (typeof window.axe === 'undefined') {
        reject(new Error('axe-core not loaded'));
        return;
      }

      // @ts-expect-error - axe is injected globally
      window.axe
        .run({
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
        })
        .then(resolve)
        .catch(reject);
    });
  });

  return results;
}

export async function scanUrl(url: string): Promise<ScanResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`[SCANNER] Starting scan for ${url}`);

    // Launch browser
    browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set timeout
    page.setDefaultTimeout(SCAN_TIMEOUT);

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCAN_TIMEOUT,
    });

    console.log(`[SCANNER] Page loaded, running axe scan`);

    // Run axe scan
    const axeResults = await runAxeScan(page);

    console.log(`[SCANNER] Scan complete. Found ${axeResults.violations.length} violation types`);

    // Count violations by impact
    const violationCounts = countViolationsByImpact(axeResults.violations);
    const totalViolations =
      violationCounts.critical +
      violationCounts.serious +
      violationCounts.moderate +
      violationCounts.minor;

    // Calculate score
    const score = calculateScore(violationCounts, totalViolations);

    // Extract highlights
    const highlights = extractHighlights(axeResults.violations);

    return {
      success: true,
      score,
      totalViolations,
      critical: violationCounts.critical,
      serious: violationCounts.serious,
      moderate: violationCounts.moderate,
      minor: violationCounts.minor,
      highlights,
      scannedUrl: url,
    };
  } catch (error) {
    console.error('[SCANNER] Scan failed:', error);
    return {
      success: false,
      score: 0,
      totalViolations: 0,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      highlights: [],
      scannedUrl: url,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    // Cleanup
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.error('[SCANNER] Error closing page:', e);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('[SCANNER] Error closing browser:', e);
      }
    }
  }
}
