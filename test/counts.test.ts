import { describe, expect, it } from 'vitest';
import { countNight } from '../src/digest/counts.js';

describe('countNight', () => {
  it('counts run lines per status and skips lines that do not parse', () => {
    expect(countNight('runs', '2026-10-28')).toEqual({ ok: 10, retry: 4, fail: 1 });
  });

  it('is null for a night that is not on disk', () => {
    expect(countNight('runs', '2000-01-01')).toBeNull();
  });
});
