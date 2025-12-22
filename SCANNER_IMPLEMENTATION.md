# VexnexaScan Implementation Guide

## Architecture Overview

VexnexaScan is a lead-generation accessibility scanning tool that provides automated WCAG 2.1 AA scans using axe-core.

### Request Flow

```
User submits URL + email
  ↓
POST /api/scan-request
  ↓
Validation + Rate Limiting
  ↓
Start Background Scan (non-blocking)
  ↓
Return immediate response to user
  ↓
[Background] Run axe-core scan with Puppeteer
  ↓
[Background] Send branded HTML email via Resend
```

---

## Files Created/Modified

### New Files

1. **src/lib/scanner.ts**
   - Puppeteer + axe-core integration
   - Scans URL for WCAG 2.1 AA violations
   - Returns structured scan results with score (0-100)

2. **src/lib/email.ts**
   - Resend integration
   - Branded HTML email templates
   - Success and failure email variants

3. **src/lib/domain-limiter.ts**
   - Domain-based rate limiting
   - Prevents scanning same domain within 24 hours
   - In-memory storage with automatic cleanup

4. **.env.example**
   - Environment variable template

### Modified Files

1. **src/app/api/scan-request/route.ts**
   - Integrated background scanning
   - Added domain-based rate limiting
   - Fire-and-forget async execution pattern

2. **package.json**
   - Added dependencies: puppeteer-core, @sparticuz/chromium, axe-core, resend

---

## Environment Variables

### Required

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get:**
1. Sign up at https://resend.com
2. Verify your sending domain (scan.vexnexa.com)
3. Create API key in dashboard
4. Add to Vercel environment variables

### Optional

```bash
# For local development only
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome

# Override base URL (defaults to https://scan.vexnexa.com)
NEXT_PUBLIC_BASE_URL=https://scan.vexnexa.com
```

---

## Vercel Configuration

### 1. Add Environment Variable

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add `RESEND_API_KEY` with your key
3. Add to Production, Preview, and Development
4. Redeploy

### 2. Domain Configuration for Resend

In Resend Dashboard:
1. Go to Domains → Add Domain
2. Add `scan.vexnexa.com`
3. Configure DNS records as instructed
4. Verify domain

### 3. Function Configuration

The scanner works within Vercel's limits:
- **Hobby Plan**: 10s execution limit (may timeout for slow sites)
- **Pro Plan**: 60s execution limit (recommended)
- **Enterprise Plan**: 300s execution limit

For production use, **Pro plan or higher** is recommended.

---

## Rate Limiting

### IP-Based (existing)
- **Limit**: 20 requests per 10 minutes per IP
- **Implementation**: src/lib/rate-limiter.ts
- **Scope**: All API requests

### Domain-Based (new)
- **Limit**: 1 scan per domain per 24 hours
- **Implementation**: src/lib/domain-limiter.ts
- **Scope**: Scan requests only

---

## Scan Results Structure

```typescript
{
  success: boolean;
  score: number;              // 0-100
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  highlights: Array<{
    id: string;               // e.g., "color-contrast"
    impact: string;           // "critical" | "serious" | "moderate" | "minor"
    description: string;
    helpUrl: string;
  }>;
  scannedUrl: string;
  error?: string;
}
```

---

## Email Templates

### Success Email
- Score display (0-100 with color coding)
- Breakdown by severity (critical, serious, moderate, minor)
- Top 3 issues with details
- CTA: "Get Full WCAG Report"

### Failure Email
- Error message
- Possible reasons (blocking, auth, unavailable)
- CTA: "Contact VexNexa Team"

---

## Security Features

### Input Validation
- URL normalization (forces HTTPS)
- Email validation
- Consent checkbox requirement

### Abuse Prevention
- Honeypot field (company)
- IP-based rate limiting
- Domain-based rate limiting
- Request logging with sanitized data

### Error Handling
- Try/catch around scanner
- Fallback failure email
- Timeout handling (30s)
- Browser cleanup in finally blocks

---

## Testing Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env.local`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome  # Optional
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test Scan Request

```bash
curl -X POST http://localhost:3000/api/scan-request \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "email": "your@email.com",
    "consent": true
  }'
```

Expected response:
```json
{
  "ok": true,
  "ref": "VX-XXXXXXXXXX",
  "message": "Scan started. Results will be emailed to you shortly."
}
```

### 5. Check Logs

Watch console for:
```
[SCAN_REQUEST] ...
[BACKGROUND_SCAN] Starting scan...
[SCANNER] Page loaded, running axe scan
[SCANNER] Scan complete. Found X violation types
[EMAIL] Successfully sent scan result email...
```

---

## Production Deployment

### Build Verification

```bash
npm run build
```

Should complete without errors.

### Deploy to Vercel

```bash
git add .
git commit -m "feat: implement axe-core scanning and email delivery"
git push origin main
```

Vercel will automatically deploy.

### Post-Deployment Checklist

- [ ] Environment variable `RESEND_API_KEY` is set
- [ ] Resend domain `scan.vexnexa.com` is verified
- [ ] Test scan request on production
- [ ] Verify email delivery
- [ ] Check Vercel function logs
- [ ] Monitor for timeout errors (upgrade plan if needed)

---

## Troubleshooting

### "Browser failed to launch"

**Cause**: Chromium not found on Vercel

**Solution**: Ensure `@sparticuz/chromium` is installed:
```bash
npm install @sparticuz/chromium
```

### "Scan timeout"

**Cause**: Website takes >30s to load

**Options**:
1. Increase timeout in scanner.ts (requires Vercel Pro)
2. Send failure email with timeout message
3. Optimize scan scope

### "Email not sending"

**Checks**:
1. Verify `RESEND_API_KEY` is set in Vercel
2. Verify domain in Resend dashboard
3. Check DNS records for sending domain
4. Review Resend dashboard logs

### "Domain limit not working"

**Cause**: In-memory storage resets on serverless cold start

**Solution**: For persistent storage, integrate Redis or database (future enhancement)

---

## Future Enhancements (Not Implemented)

- PDF report generation
- Database persistence for scan history
- Multi-page scanning
- User dashboards
- Manual testing options
- VPAT/ACR document generation

---

## Dependencies Added

```json
{
  "puppeteer-core": "^XX.X.X",
  "@sparticuz/chromium": "^XXX.X.X",
  "axe-core": "^X.X.X",
  "resend": "^X.X.X"
}
```

All dependencies are production-safe for Vercel deployment.

---

## Support

For issues or questions:
- Email: support@vexnexa.com
- GitHub: Jeffrey1982/vexnexa-scan
