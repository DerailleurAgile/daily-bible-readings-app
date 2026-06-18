// scripts/generate-prayers-manifest.mjs
// Usage: node scripts/generate-prayers-manifest.mjs
// Generates a manifest.json mapping prayer file names to content hashes for cache invalidation.
// Run automatically via prebuild and predev. Re-run manually after editing any prayer .txt file.

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = './public/prayers';
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json');

const manifest = {};

readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.txt'))
  .sort()
  .forEach((filename) => {
    const key = filename.replace('.txt', '');
    const content = readFileSync(join(DATA_DIR, filename));
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 8);
    manifest[key] = hash;
  });

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log('Prayer manifest written:', manifest);
