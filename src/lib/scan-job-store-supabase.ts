// ─── Supabase-Backed Scan Job Store ───
// Replaces the in-memory scan-job-store.ts for serverless reliability.
// All operations use the service-role Supabase client (server-side only).

import { getSupabaseServer } from './supabase-server';

// ─── Types ───

export type ScanJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'rejected' | 'rate_limited';

export interface ScanJobRow {
  id: string;
  domain: string;
  scan_url: string;
  status: ScanJobStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string;
  ip: string | null;
  is_admin: boolean;
  duration_ms: number | null;
  error: string | null;
  result_json: Record<string, unknown> | null;
}

/** Shape returned to API consumers (camelCase) */
export interface ScanJob {
  id: string;
  domain: string;
  scanUrl: string;
  status: ScanJobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
  ip: string | null;
  isAdmin: boolean;
  durationMs: number | null;
  error: string | null;
  resultJson: Record<string, unknown> | null;
}

// ─── Row ↔ ScanJob mapping ───

function rowToJob(row: ScanJobRow): ScanJob {
  return {
    id: row.id,
    domain: row.domain,
    scanUrl: row.scan_url,
    status: row.status,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    expiresAt: row.expires_at,
    ip: row.ip,
    isAdmin: row.is_admin,
    durationMs: row.duration_ms,
    error: row.error,
    resultJson: row.result_json,
  };
}

// ─── Public API ───

/**
 * Create a new scan job in Supabase. Returns the created job.
 */
export async function createScanJob(params: {
  domain: string;
  scanUrl: string;
  ip: string;
  isAdmin: boolean;
}): Promise<ScanJob> {
  const sb = getSupabaseServer();

  const { data, error } = await sb
    .from('scan_jobs')
    .insert({
      domain: params.domain,
      scan_url: params.scanUrl,
      status: 'queued',
      ip: params.ip,
      is_admin: params.isAdmin,
    })
    .select('*')
    .single();

  if (error || !data) {
    const raw: string = error ? JSON.stringify(error) : 'null';
    console.error('[scan-job-store] createScanJob error:', raw);
    throw new Error(`Failed to create scan job: ${raw}`);
  }

  return rowToJob(data as ScanJobRow);
}

/**
 * Get a scan job by ID.
 */
export async function getScanJob(jobId: string): Promise<ScanJob | null> {
  const sb = getSupabaseServer();

  const { data, error } = await sb
    .from('scan_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !data) return null;
  return rowToJob(data as ScanJobRow);
}

/**
 * Update a scan job's fields. Returns the updated job.
 */
export async function updateScanJob(
  jobId: string,
  patch: Partial<{
    status: ScanJobStatus;
    started_at: string;
    completed_at: string;
    duration_ms: number;
    error: string;
    result_json: Record<string, unknown>;
  }>,
): Promise<ScanJob | null> {
  const sb = getSupabaseServer();

  const { data, error } = await sb
    .from('scan_jobs')
    .update(patch)
    .eq('id', jobId)
    .select('*')
    .single();

  if (error || !data) {
    console.error('[scan-job-store] updateScanJob error:', error ? JSON.stringify(error) : 'null');
    return null;
  }

  return rowToJob(data as ScanJobRow);
}

/**
 * Find an active (queued or running) job for a domain that hasn't expired.
 * Used to deduplicate scan requests.
 */
export async function findActiveJobForDomain(domain: string): Promise<ScanJob | null> {
  const sb = getSupabaseServer();

  const { data, error } = await sb
    .from('scan_jobs')
    .select('*')
    .eq('domain', domain)
    .in('status', ['queued', 'running'])
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return rowToJob(data as ScanJobRow);
}

/**
 * Fetch N queued jobs that haven't expired, ordered FIFO.
 * Used by the worker endpoint to pick up work.
 */
export async function fetchQueuedJobs(limit: number = 3): Promise<ScanJob[]> {
  const sb = getSupabaseServer();

  const { data, error } = await sb
    .from('scan_jobs')
    .select('*')
    .eq('status', 'queued')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data) {
    if (error) console.error('[scan-job-store] fetchQueuedJobs error:', JSON.stringify(error));
    return [];
  }

  return (data as ScanJobRow[]).map(rowToJob);
}

/**
 * Mark expired queued/running jobs as failed.
 * Called periodically by the worker to prevent stale jobs.
 */
export async function cleanupExpiredJobs(): Promise<number> {
  const sb = getSupabaseServer();
  const now: string = new Date().toISOString();

  const { data, error } = await sb
    .from('scan_jobs')
    .update({
      status: 'failed',
      error: 'Job expired before processing.',
      completed_at: now,
    })
    .in('status', ['queued', 'running'])
    .lt('expires_at', now)
    .select('id');

  if (error) {
    console.error('[scan-job-store] cleanupExpiredJobs error:', JSON.stringify(error));
    return 0;
  }

  return data?.length ?? 0;
}
