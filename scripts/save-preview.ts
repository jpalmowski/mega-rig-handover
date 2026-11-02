import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createApp } from '../src/app.js';

// Plan morning-digest § 3 and § 4. Saves one rig page as one self-contained HTML file
// (ADR 0001), lane banner included, so it can go on a public host. Never commit the output
// (ADR 0003). Usage: tsx scripts/save-preview.ts [path] [out]
const path = process.argv[2] ?? '/digest/2026-10-28';
const out = process.argv[3] ?? 'var/preview/index.html';

const res = await createApp().request(path);
if (res.status !== 200) {
  console.error(`${path} answered ${res.status}`);
  process.exit(1);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, await res.text());
console.log(`saved ${path} -> ${out}`);
