import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLine } from './reader.js';

export type NightCounts = { ok: number; retry: number; fail: number };

// Run lines per status for one night. Lines that do not parse are not counted.
// null when runs/<night>.jsonl cannot be read.
export function countNight(runsDir: string, night: string): NightCounts | null {
  let text: string;
  try {
    text = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  } catch {
    return null;
  }
  const counts: NightCounts = { ok: 0, retry: 0, fail: 0 };
  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === '') continue;
    const l = parseLine(raw);
    if (l) counts[l.status]++;
  }
  return counts;
}
