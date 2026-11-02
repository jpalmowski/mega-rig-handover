// Plan morning-digest § 1. The contract every part of § 2 builds against: one row per job
// for one night of runs/<night>.jsonl.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of the run log, after parsing.
export type RunLine = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

export type DigestRow = {
  job: string;
  // Owner on the job's last line. null renders as "—".
  owner: string | null;
  // Lines for this job, any status.
  runs: number;
  // Lines with status "retry".
  retries: number;
  lastStatus: RunStatus;
  // Most recent error for this job, or null if it never had one.
  lastError: string | null;
  // Times as written in the log, offset kept.
  firstAt: string;
  lastAt: string;
};

export type NightDigest = {
  night: string;
  // Sorted by job.
  rows: DigestRow[];
  // Lines that did not parse. Counted, never thrown.
  badLines: number;
};

// night is YYYY-MM-DD. Returns null when runs/<night>.jsonl does not exist (the routes answer
// 404); an empty file gives a digest with no rows.
export type ReadNight = (runsDir: string, night: string) => NightDigest | null;
