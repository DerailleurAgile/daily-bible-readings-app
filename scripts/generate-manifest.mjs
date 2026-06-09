// scripts/generate-manifest.mjs
// Usage: node scripts/generate-manifest.mjs
// Generates a manifest.json mapping month (MM) to content hash for cache validation in the app.
// Why .mjs? Because it uses ES (ECMAScript) modules and top-level await, which require the .mjs extension or "type": "module" in package.json.
// Requires Node 18+ (built-in crypto)

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = './public/monthly';
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json');

const manifest = {};

readdirSync(DATA_DIR)
  .filter((f) => /^\d{2}\.json$/.test(f))
  .sort()
  .forEach((filename) => {
    const month = filename.replace('.json', '');
    const content = readFileSync(join(DATA_DIR, filename));
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 8);
    manifest[month] = hash;
  });

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log('Manifest written:', manifest);