import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VexNexa Scanner — Free WCAG Accessibility Audit',
    template: '%s | VexNexa Scanner',
  },
  description:
    'Scan any website for WCAG 2.2 accessibility issues. Get a detailed report with actionable fixes, contrast analysis, ARIA audits, and more — completely free.',
  metadataBase: new URL('https://scan.vexnexa.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VexNexa Scanner',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {GA4_MEASUREMENT_ID && (
          <>
            {/* Google Analytics 4 */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_MEASUREMENT_ID}', {
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.className} font-sans antialiased`}>{children}</body>
    </html>
  );
}
