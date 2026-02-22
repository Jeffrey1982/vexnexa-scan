/**
 * Strict domain normalization for scan URLs.
 * Rules:
 *  1. decodeURIComponent
 *  2. trim + lowercase
 *  3. strip leading http:// or https://
 *  4. strip everything after first "/" (path, query, hash)
 *  5. strip trailing dots
 *  6. must contain at least one dot and no spaces
 */
export function normalizeDomain(input: string): string {
  let domain: string = decodeURIComponent(input).trim().toLowerCase();

  // Strip protocol
  domain = domain.replace(/^https?:\/\//, '');

  // Strip www. prefix (optional but common)
  // Keep this commented out if you want to preserve www subdomains:
  // domain = domain.replace(/^www\./, '');

  // Strip path, query, hash — everything after first "/"
  const slashIndex: number = domain.indexOf('/');
  if (slashIndex !== -1) {
    domain = domain.substring(0, slashIndex);
  }

  // Strip trailing dots
  domain = domain.replace(/\.+$/, '');

  // Validation
  if (!domain || domain.includes(' ')) {
    throw new DomainValidationError(`Invalid domain: "${input}"`);
  }

  if (!domain.includes('.')) {
    throw new DomainValidationError(
      `Domain must contain at least one dot: "${input}"`,
    );
  }

  return domain;
}

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}
