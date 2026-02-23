import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-nav.svg"
              alt="VexNexa Scanner"
              width={160}
              height={32}
              priority
              className="h-8 w-auto"
            />
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
