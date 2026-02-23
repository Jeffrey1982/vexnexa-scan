import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="section-container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo-nav.svg"
                alt="VexNexa Scanner"
                width={160}
                height={32}
                className="h-8 w-auto"
              />
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
