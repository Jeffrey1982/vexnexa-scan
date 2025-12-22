import { Resend } from 'resend';
import type { ScanResult } from './scanner';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

const VEXNEXA_COLORS = {
  primary: '#1E1E1E', // Midnight Graphite
  accent: '#FF6B35', // Aurora Orange
  secondary: '#118AB2', // Plasma Blue
  background: '#F8F9FA', // Cloud White
  muted: '#C0C3C7', // Ash Gray
};

interface EmailParams {
  to: string;
  scanResult: ScanResult;
  refId: string;
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
}

function getImpactBadgeColor(impact: string): string {
  switch (impact.toLowerCase()) {
    case 'critical':
      return '#DC2626';
    case 'serious':
      return '#EA580C';
    case 'moderate':
      return '#F59E0B';
    case 'minor':
      return '#6B7280';
    default:
      return VEXNEXA_COLORS.muted;
  }
}

function generateSuccessEmailHtml(params: EmailParams): string {
  const { scanResult, refId } = params;
  const domain = extractDomain(scanResult.scannedUrl);
  const scoreColor = getScoreColor(scanResult.score);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WCAG Scan Results - ${domain}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${VEXNEXA_COLORS.background};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${VEXNEXA_COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; border-bottom: 1px solid ${VEXNEXA_COLORS.muted};">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${VEXNEXA_COLORS.primary};">VexnexaScan</h1>
            </td>
          </tr>

          <!-- Score Section -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="display: inline-block; background-color: ${scoreColor}; color: white; width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <div>
                  <div style="font-size: 48px; font-weight: 700; line-height: 1;">${scanResult.score}</div>
                  <div style="font-size: 14px; font-weight: 500; margin-top: 4px;">/ 100</div>
                </div>
              </div>
              <h2 style="margin: 24px 0 8px 0; font-size: 28px; font-weight: 700; color: ${VEXNEXA_COLORS.primary};">Accessibility Score</h2>
              <p style="margin: 0; font-size: 16px; color: #666;">for ${domain}</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #999;">Reference: ${refId}</p>
            </td>
          </tr>

          <!-- Summary Stats -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="25%" align="center" style="padding: 20px; background-color: #FEF2F2; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #DC2626; margin-bottom: 8px;">${scanResult.critical}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #991B1B; text-transform: uppercase;">Critical</div>
                  </td>
                  <td width="25%" align="center" style="padding: 20px; background-color: #FFF7ED; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #EA580C; margin-bottom: 8px;">${scanResult.serious}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #C2410C; text-transform: uppercase;">Serious</div>
                  </td>
                  <td width="25%" align="center" style="padding: 20px; background-color: #FFFBEB; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #F59E0B; margin-bottom: 8px;">${scanResult.moderate}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #D97706; text-transform: uppercase;">Moderate</div>
                  </td>
                  <td width="25%" align="center" style="padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #6B7280; margin-bottom: 8px;">${scanResult.minor}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #4B5563; text-transform: uppercase;">Minor</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Issues -->
          ${
            scanResult.highlights.length > 0
              ? `
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: ${VEXNEXA_COLORS.primary};">Top Issues Found</h3>
              ${scanResult.highlights
                .map(
                  (issue) => `
              <div style="margin-bottom: 16px; padding: 16px; background-color: ${VEXNEXA_COLORS.background}; border-radius: 8px; border-left: 4px solid ${getImpactBadgeColor(
                    issue.impact
                  )};">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="display: inline-block; padding: 4px 8px; background-color: ${getImpactBadgeColor(
                    issue.impact
                  )}; color: white; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-right: 8px;">${
                    issue.impact
                  }</span>
                  <span style="font-size: 14px; font-weight: 600; color: ${VEXNEXA_COLORS.primary};">${
                    issue.id
                  }</span>
                </div>
                <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">${issue.description}</p>
                <a href="${
                  issue.helpUrl
                }" style="display: inline-block; margin-top: 8px; font-size: 13px; color: ${
                    VEXNEXA_COLORS.secondary
                  }; text-decoration: none;">Learn how to fix →</a>
              </div>
              `
                )
                .join('')}
            </td>
          </tr>
          `
              : ''
          }

          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <div style="padding: 24px; background-color: ${VEXNEXA_COLORS.background}; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 16px; color: ${VEXNEXA_COLORS.primary}; font-weight: 500;">This is a quick scan result. Get a comprehensive WCAG audit with:</p>
                <ul style="margin: 0; padding: 0; list-style: none; text-align: left; max-width: 400px; margin: 0 auto 20px auto;">
                  <li style="margin: 8px 0; padding-left: 24px; position: relative; font-size: 14px; color: #666;">
                    <span style="position: absolute; left: 0; color: ${VEXNEXA_COLORS.secondary};">✓</span>
                    Detailed violation reports for every page
                  </li>
                  <li style="margin: 8px 0; padding-left: 24px; position: relative; font-size: 14px; color: #666;">
                    <span style="position: absolute; left: 0; color: ${VEXNEXA_COLORS.secondary};">✓</span>
                    Prioritized remediation roadmap
                  </li>
                  <li style="margin: 8px 0; padding-left: 24px; position: relative; font-size: 14px; color: #666;">
                    <span style="position: absolute; left: 0; color: ${VEXNEXA_COLORS.secondary};">✓</span>
                    Manual testing by accessibility experts
                  </li>
                  <li style="margin: 8px 0; padding-left: 24px; position: relative; font-size: 14px; color: #666;">
                    <span style="position: absolute; left: 0; color: ${VEXNEXA_COLORS.secondary};">✓</span>
                    VPAT/ACR documentation
                  </li>
                </ul>
              </div>
              <a href="https://vexnexa.com/contact" style="display: inline-block; padding: 16px 32px; background-color: ${VEXNEXA_COLORS.accent}; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">Get Full WCAG Report</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px; border-top: 1px solid ${VEXNEXA_COLORS.muted}; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">© ${new Date().getFullYear()} VexnexaScan. All rights reserved.</p>
              <p style="margin: 0; font-size: 12px; color: #999;">This scan was performed using automated tools. Results should be verified manually.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateFailureEmailHtml(params: EmailParams): string {
  const { scanResult, refId } = params;
  const domain = extractDomain(scanResult.scannedUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan Error - ${domain}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${VEXNEXA_COLORS.background};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${VEXNEXA_COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; border-bottom: 1px solid ${VEXNEXA_COLORS.muted};">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${VEXNEXA_COLORS.primary};">VexnexaScan</h1>
            </td>
          </tr>

          <!-- Error Message -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FEF2F2; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <span style="font-size: 40px;">⚠️</span>
              </div>
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: ${VEXNEXA_COLORS.primary};">Scan Could Not Complete</h2>
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #666;">We encountered an issue scanning ${domain}</p>
              <p style="margin: 0; font-size: 14px; color: #999;">Reference: ${refId}</p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="padding: 20px; background-color: ${VEXNEXA_COLORS.background}; border-radius: 8px; border-left: 4px solid #EF4444;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: ${VEXNEXA_COLORS.primary};">Possible Reasons:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.6;">
                  <li>The website may be blocking automated scanners</li>
                  <li>The website may require authentication to access</li>
                  <li>The website may be temporarily unavailable</li>
                  <li>The URL may be incorrect or unreachable</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: ${VEXNEXA_COLORS.primary};">Want a manual accessibility audit instead?</p>
              <a href="https://vexnexa.com/contact" style="display: inline-block; padding: 16px 32px; background-color: ${VEXNEXA_COLORS.accent}; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Contact VexNexa Team</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px; border-top: 1px solid ${VEXNEXA_COLORS.muted}; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">© ${new Date().getFullYear()} VexnexaScan. All rights reserved.</p>
              <p style="margin: 0; font-size: 12px; color: #999;">If you believe this is an error, please contact support@vexnexa.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendScanResultEmail(params: EmailParams): Promise<void> {
  const { to, scanResult, refId } = params;
  const domain = extractDomain(scanResult.scannedUrl);

  try {
    const resend = getResendClient();
    const isSuccess = scanResult.success;
    const criticalCount = scanResult.critical;

    const subject = isSuccess
      ? `WCAG Scan Results for ${domain}${criticalCount > 0 ? ` – ${criticalCount} Critical Issue${criticalCount !== 1 ? 's' : ''} Found` : ''}`
      : `Scan Error for ${domain}`;

    const html = isSuccess
      ? generateSuccessEmailHtml(params)
      : generateFailureEmailHtml(params);

    await resend.emails.send({
      from: 'VexnexaScan <noreply@scan.vexnexa.com>',
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Successfully sent scan result email to ${to} (ref: ${refId})`);
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    throw error;
  }
}
