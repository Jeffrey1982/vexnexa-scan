interface DomainRecord {
  lastScanTime: number;
}

class DomainLimiter {
  private store: Map<string, DomainRecord> = new Map();
  private readonly cooldownMs: number;

  constructor(cooldownHours: number = 24) {
    this.cooldownMs = cooldownHours * 60 * 60 * 1000;

    // Cleanup old entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      // Normalize to base domain (without www)
      return urlObj.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      // If URL parsing fails, use the raw string
      return url.replace(/^www\./, '').toLowerCase();
    }
  }

  canScan(url: string): { allowed: boolean; timeUntilReset?: number } {
    const domain = this.extractDomain(url);
    const now = Date.now();
    const record = this.store.get(domain);

    if (!record) {
      // First time scanning this domain
      return { allowed: true };
    }

    const timeSinceLastScan = now - record.lastScanTime;

    if (timeSinceLastScan >= this.cooldownMs) {
      // Cooldown period has passed
      return { allowed: true };
    }

    // Still in cooldown period
    const timeUntilReset = this.cooldownMs - timeSinceLastScan;
    return { allowed: false, timeUntilReset };
  }

  recordScan(url: string): void {
    const domain = this.extractDomain(url);
    this.store.set(domain, {
      lastScanTime: Date.now(),
    });
  }

  private cleanup() {
    const now = Date.now();
    for (const [domain, record] of this.store.entries()) {
      if (now - record.lastScanTime > this.cooldownMs * 2) {
        // Remove records that are older than 2x the cooldown period
        this.store.delete(domain);
      }
    }
  }

  // For testing/debugging
  getRemainingTime(url: string): number | null {
    const domain = this.extractDomain(url);
    const record = this.store.get(domain);

    if (!record) return null;

    const timeSinceLastScan = Date.now() - record.lastScanTime;
    const remaining = this.cooldownMs - timeSinceLastScan;

    return remaining > 0 ? remaining : 0;
  }

  // Format time for user-friendly messages
  formatRemainingTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
    }

    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
}

// Singleton instance - 24 hour cooldown per domain
export const domainLimiter = new DomainLimiter(24);
