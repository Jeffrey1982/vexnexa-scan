// ─── Structured Scan Logging ───
// Logs scan requests in a consistent JSON format for abuse detection and debugging.

export type ScanLogResult = 'queued' | 'completed' | 'failed' | 'rate_limited' | 'rejected';

export interface ScanLogEntry {
  event: 'scan_request';
  ip: string;
  domain: string;
  timestamp: string;
  result: ScanLogResult;
  jobId?: string;
  isAdmin?: boolean;
  durationMs?: number;
  error?: string;
}

/**
 * Emit a structured scan log entry to stdout (picked up by Vercel log drain).
 */
export function logScanEvent(entry: ScanLogEntry): void {
  const payload: Record<string, unknown> = {
    event: entry.event,
    ip: entry.ip,
    domain: entry.domain,
    timestamp: entry.timestamp,
    result: entry.result,
  };

  if (entry.jobId) payload.jobId = entry.jobId;
  if (entry.isAdmin) payload.isAdmin = true;
  if (entry.durationMs !== undefined) payload.durationMs = entry.durationMs;
  if (entry.error) payload.error = entry.error.substring(0, 500);

  console.log('[SCAN_LOG]', JSON.stringify(payload));
}
