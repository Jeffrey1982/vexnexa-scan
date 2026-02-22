import Link from 'next/link';

export default function Footer() {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="section-container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold font-heading text-text-primary">
                Vex<span className="text-primary">Nexa</span> Scanner
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Free WCAG 2.2 accessibility scanner. Identify issues, get actionable fixes, and make the web accessible for everyone.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-text-primary mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-text-muted hover:text-primary transition-colors">
                  Free Scan
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-text-muted hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#examples" className="text-sm text-text-muted hover:text-primary transition-colors">
                  Example Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-text-primary mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/en/what-is-wcag-compliance" className="text-sm text-text-muted hover:text-primary transition-colors">
                  What is WCAG?
                </Link>
              </li>
              <li>
                <Link href="/en/wcag-2-2-compliance-checklist" className="text-sm text-text-muted hover:text-primary transition-colors">
                  WCAG Checklist
                </Link>
              </li>
              <li>
                <Link href="/en/website-accessibility-audit-guide" className="text-sm text-text-muted hover:text-primary transition-colors">
                  Audit Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/en/privacy" className="text-sm text-text-muted hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/en/contact" className="text-sm text-text-muted hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {currentYear} VexNexa. All rights reserved.
          </p>
          <p className="text-sm text-text-muted">
            Built with accessibility in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
