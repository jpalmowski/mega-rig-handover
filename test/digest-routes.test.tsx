import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { DigestRow } from '../src/digest/types.js';

// Sorted by job, as readNight returns them.
const JOBS = ['digest/render', 'fixtures/refresh', 'lane/sync', 'notes/backup', 'rig/rotate-logs'];

let runsDir: string;

beforeAll(() => {
  // runs/ is read-only: copy the real night in, write the empty night here.
  runsDir = mkdtempSync(join(tmpdir(), 'rig-digest-'));
  copyFileSync(join(import.meta.dirname, '..', 'runs', '2026-10-28.jsonl'), join(runsDir, '2026-10-28.jsonl'));
  writeFileSync(join(runsDir, '2026-11-01.jsonl'), '');
});

afterAll(() => {
  rmSync(runsDir, { recursive: true, force: true });
});

function app() {
  return createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir });
}

// Position of each job in the HTML, asserted to be strictly ascending; returns the job order.
function htmlJobOrder(html: string): string[] {
  const positions = JOBS.map((job) => ({ job, at: html.indexOf(job) }));
  for (const p of positions) expect(p.at, `${p.job} missing from page`).toBeGreaterThanOrEqual(0);
  const ordered = [...positions].sort((a, b) => a.at - b.at);
  for (let i = 1; i < ordered.length; i++) {
    expect(ordered[i].at, `${ordered[i].job} out of order`).toBeGreaterThan(ordered[i - 1].at);
  }
  return ordered.map((p) => p.job);
}

describe('GET /digest/:night (page)', () => {
  it('renders the night with every job in order, a null owner and the bad-line count', async () => {
    const res = await app().request('/digest/2026-10-28');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('digest · 2026-10-28');
    expect(htmlJobOrder(html)).toEqual(JOBS);
    expect(html).toContain('—');
    expect(html).toContain('1 line(s) did not parse');
  });

  it('answers 404 for a night with no file', async () => {
    const res = await app().request('/digest/2026-01-01');
    expect(res.status).toBe(404);
  });

  it('renders the empty night as nothing ran', async () => {
    const res = await app().request('/digest/2026-11-01');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('nothing ran');
  });
});

describe('GET /api/digest/:night (JSON)', () => {
  it('returns the night with rows in job order, a bad-line count and a null owner', async () => {
    const res = await app().request('/api/digest/2026-10-28');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { night: string; rows: DigestRow[]; badLines: number };
    expect(body.night).toBe('2026-10-28');
    expect(body.badLines).toBe(1);
    expect(body.rows.map((r) => r.job)).toEqual(JOBS);
    const render = body.rows.find((r) => r.job === 'digest/render');
    expect(render?.owner).toBeNull();
  });

  it('answers 404 for a night with no file', async () => {
    const res = await app().request('/api/digest/2026-01-01');
    expect(res.status).toBe(404);
  });

  it('returns an empty night with no rows and no bad lines', async () => {
    const res = await app().request('/api/digest/2026-11-01');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rows: DigestRow[]; badLines: number };
    expect(body.rows).toEqual([]);
    expect(body.badLines).toBe(0);
  });
});

describe('digest page and JSON agree', () => {
  it('lists the jobs in the same order', async () => {
    const page = await app().request('/digest/2026-10-28');
    const api = await app().request('/api/digest/2026-10-28');
    expect(page.status).toBe(200);
    expect(api.status).toBe(200);
    const html = await page.text();
    const body = (await api.json()) as { rows: DigestRow[] };
    expect(htmlJobOrder(html)).toEqual(body.rows.map((r) => r.job));
  });
});
