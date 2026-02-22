import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold font-heading text-text-primary">
              Vex<span className="text-primary">Nexa</span> Scanner
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/"
              className="btn-primary text-sm px-5 py-2"
            >
              Free Scan
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-neutral-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
