// scripts/generate-manifests.mjs
// Generates manifest.json for both /public/monthly and /public/prayers.
// Run automatically via prebuild and predev. Re-run manually after editing any data file.
// Requires Node 18+ (built-in crypto)

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

function generateManifest(dir, filter, keyFn, label) {
  const manifest = {};
  readdirSync(dir)
    .filter(filter)
    .sort()
    .forEach((filename) => {
      const content = readFileSync(join(dir, filename));
      manifest[keyFn(filename)] = createHash('sha256').update(content).digest('hex').slice(0, 8);
    });
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`${label} manifest written:`, manifest);
}

generateManifest('./public/monthly', (f) => /^\d{2}\.json$/.test(f), (f) => f.replace('.json', ''), 'Monthly');
generateManifest('./public/prayers',  (f) => f.endsWith('.txt'),       (f) => f.replace('.txt', ''),  'Prayer');
