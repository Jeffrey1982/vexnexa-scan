// ─── In-Memory Scan Job Store ───
// Tracks scan jobs so the API can return immediately and clients poll for results.
// Jobs are ephemeral — they live only as long as the serverless instance.
// For multi-instance, migrate to Supabase or Redis.

export type ScanJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ScanJob {
  id: string;
  domain: string;
  scanUrl: string;
  makePublic: boolean;
  status: ScanJobStatus;
  createdAt: string;
  updatedAt: string;
  /** Set when status becomes 'completed' */
  reportId?: string;
  privateToken?: string;
  publicUrl?: string;
  privateUrl?: string;
  timings?: Record<string, number>;
  /** Set when status becomes 'failed' */
  error?: string;
}

/** In-memory store: jobId → ScanJob */
const jobs: Map<string, ScanJob> = new Map();

/** Max age before a job is garbage-collected (15 minutes) */
const JOB_TTL_MS: number = 15 * 60 * 1000;

/** Cleanup interval (2 minutes) */
const CLEANUP_INTERVAL_MS: number = 2 * 60 * 1000;
let lastCleanup: number = Date.now();

function maybeCleanup(): void {
  const now: number = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [id, job] of jobs) {
    const age: number = now - new Date(job.createdAt).getTime();
    if (age > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
}

/**
 * Create a new scan job and return it.
 */
export function createScanJob(params: {
  id: string;
  domain: string;
  scanUrl: string;
  makePublic: boolean;
}): ScanJob {
  maybeCleanup();

  const now: string = new Date().toISOString();
  const job: ScanJob = {
    id: params.id,
    domain: params.domain,
    scanUrl: params.scanUrl,
    makePublic: params.makePublic,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(job.id, job);
  return job;
}

/**
 * Get a scan job by ID.
 */
export function getScanJob(id: string): ScanJob | null {
  maybeCleanup();
  return jobs.get(id) ?? null;
}

/**
 * Update a scan job's status and optional result fields.
 */
export function updateScanJob(
  id: string,
  update: Partial<Pick<ScanJob, 'status' | 'reportId' | 'privateToken' | 'publicUrl' | 'privateUrl' | 'timings' | 'error'>>,
): ScanJob | null {
  const job: ScanJob | undefined = jobs.get(id);
  if (!job) return null;

  Object.assign(job, update, { updatedAt: new Date().toISOString() });
  return job;
}

/**
 * Check if a domain already has a pending/running job.
 * Returns the existing job if found, to prevent duplicate scans.
 */
export function findActiveJobForDomain(domain: string): ScanJob | null {
  for (const job of jobs.values()) {
    if (job.domain === domain && (job.status === 'pending' || job.status === 'running')) {
      return job;
    }
  }
  return null;
}
