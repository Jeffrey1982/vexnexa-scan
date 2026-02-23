# VexnexaScan - WCAG 2.2 Quick Scan

A production-ready Next.js application for providing free WCAG 2.2 accessibility scans. Built with App Router, TypeScript, and Tailwind CSS.

## Features

- **Multi-language support**: 5 languages (English, Dutch, German, French, Spanish)
- **Locale-based routing**: All pages use `/[locale]/...` URL structure
- **Smart locale detection**: Cookie-based preferences with Accept-Language fallback
- **Accessible design**: Premium, minimal B2B-focused UI
- **Security**: Rate limiting, honeypot protection, security headers
- **SEO optimized**: Per-locale metadata, OpenGraph tags, canonical URLs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Font**: Inter (Google Fonts)

## Project Structure

```
vexnexa-scan/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Locale-based pages
│   │   │   ├── layout.tsx         # Shared layout with header/footer
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── privacy/           # Privacy policy
│   │   │   └── contact/           # Contact page
│   │   ├── api/
│   │   │   └── scan-request/      # API endpoint for scan requests
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── LanguageSelector.tsx   # Language switcher (client)
│   │   ├── ScanForm.tsx           # Main form (client)
│   │   └── SuccessPanel.tsx       # Success state (client)
│   ├── i18n/
│   │   ├── locales.ts             # Locale configuration
│   │   ├── translations.ts        # Translation dictionaries
│   │   └── helpers.ts             # Translation helper functions
│   ├── lib/
│   │   ├── validation.ts          # Form and URL validation
│   │   ├── rate-limiter.ts        # In-memory rate limiting
│   │   └── metadata.ts            # SEO metadata generation
│   └── middleware.ts              # Locale detection and redirects
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vexnexa-scan
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

You'll be automatically redirected to a locale-based URL (e.g., `/en`).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Locale System

### How It Works

1. **Middleware Detection**: When a user visits `/`, the middleware checks:
   - Cookie `vx_locale` (if set from previous visit)
   - `Accept-Language` header (browser preference)
   - Falls back to `en` (default)

2. **Automatic Redirect**: User is redirected to `/[locale]` (e.g., `/en`, `/nl`, `/de`)

3. **Language Selector**:
   - Appears in top-right of every page
   - On change, sets cookie `vx_locale` and navigates to the same page in new locale
   - Example: `/en/privacy` → `/nl/privacy`

4. **Cookie Persistence**:
   - Cookie name: `vx_locale`
   - Max age: 1 year
   - SameSite: Lax
   - Path: /

### Supported Locales

- `en` - English
- `nl` - Nederlands (Dutch)
- `de` - Deutsch (German)
- `fr` - Français (French)
- `es` - Español (Spanish)

### Adding Translations

Edit `src/i18n/translations.ts` to add or modify translations. The structure ensures type safety and fallback to English.

## API Endpoint

### POST /api/scan-request

Accepts scan requests with the following payload:

```json
{
  "url": "https://example.com",
  "email": "user@example.com",
  "consent": true,
  "company": ""  // honeypot field (must be empty)
}
```

**Validation:**
- URL: Required, normalized to https://
- Email: Required, validated format
- Consent: Must be `true`
- Company: Honeypot field - if filled, request is silently rejected

**Rate Limiting:**
- 20 requests per 10 minutes per IP address
- Returns 429 status when exceeded

**Response:**
```json
{
  "ok": true,
  "ref": "VX-A1B2C3D4E5"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Security Features

1. **Rate Limiting**: In-memory rate limiter (20 req / 10 min per IP)
2. **Honeypot**: Hidden form field to catch bots
3. **Security Headers**:
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Powered-By header removed
4. **Input Validation**: Server-side validation for all inputs
5. **URL Normalization**: Forces HTTPS protocol
6. **Data Sanitization**: Email masking in logs

## SEO Features

- Per-locale metadata (title, description)
- OpenGraph tags for social sharing
- Canonical URLs
- Robots: index, follow
- Semantic HTML structure

## Design Philosophy

- **Premium B2B aesthetic**: Clean, professional, minimal
- **No marketing fluff**: Straightforward, trust-building content
- **Accessibility first**: Proper ARIA labels, semantic HTML, keyboard navigation
- **Mobile responsive**: Tailwind breakpoints for all screen sizes
- **Trust elements**: Subtle indicators (scan time, no obligation, objective)

## Environment Variables

### Required (Server-Side)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Dashboard > Settings > API). **Never expose client-side.** |
| `CRON_SECRET` | Secret for Vercel Cron authentication (`Authorization: Bearer`). Generate with `openssl rand -hex 32`. |
| `VEXNEXA_ADMIN_SECRET` | Secret for admin bypass header (`x-vexnexa-admin`). Defaults to `"true"` in dev. |

### Optional

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Base URL for canonical links (default: `https://scan.vexnexa.com`) |
| `ALLOW_PRIVATE_TARGETS` | Set to `"true"` to allow admin scans of private/internal IPs (default: `false`) |

### Supabase Setup

1. Run **all** migrations in order via the Supabase SQL Editor (Dashboard > SQL Editor):
   - `supabase/migrations/001_scan_reports.sql` — `scan_reports` + `scan_opt_outs` tables
   - `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
   - `supabase/migrations/003_scan_jobs.sql` — `scan_jobs` + `report_views` tables + RLS
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (local dev) and Vercel environment settings (production).

### Vercel Cron Setup

The scan worker runs as a Vercel Cron Job that processes queued scans every minute.

1. Add `CRON_SECRET` to Vercel environment variables (Dashboard > Settings > Environment Variables).
2. The cron is configured in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/scan/worker",
         "schedule": "* * * * *"
       }
     ]
   }
   ```
3. Vercel Cron automatically sends a GET to `/api/scan/worker` every minute with `Authorization: Bearer <CRON_SECRET>`.
   For manual testing, call the endpoint with:
   ```bash
   curl https://scan.vexnexa.com/api/scan/worker \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## Scan Architecture

```
Client (DomainSearchBar)
  │
  ├─ POST /api/scan          → validates input, DNS check, rate limit, creates job in Supabase
  │                             returns { jobId, domain, status: "queued" }
  │
  ├─ GET /api/scan/[id]      → polls Supabase for job status
  │                             returns { status, reportId, private_token } when completed
  │
  └─ Vercel Cron (1 min)
       │
       └─ POST /api/scan/worker  → picks up queued jobs, runs Playwright+axe scan,
                                    writes results to scan_jobs + scan_reports
```

### Security Layers

1. **Domain validation** — blocks localhost, private IPs, metadata endpoints, reserved TLDs
2. **DNS resolution guard** — resolves A/AAAA records, blocks if any IP is private/internal
3. **Rate limiting** — 5 scans/10min per IP, 6h domain cooldown, admin bypass
4. **Worker auth** — `x-worker-secret` header required for scan processing

## Production Build

```bash
npm run build
npm start
```

The production build is optimized with:
- Static page generation where possible
- Optimized fonts and images
- Minified JavaScript and CSS
- Tree-shaking for unused code

## Browser Support

Supports all modern browsers with ES2020 support:
- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## License

© 2024 VexnexaScan. All rights reserved.
