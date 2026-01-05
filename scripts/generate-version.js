const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const output = {
  version: pkg.version.trim(),
  // Only include announcement if present in package.json
  announcement: pkg.announcement || null
};

fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(output, null, 2)
);

console.log(`version.json generated with version = ${pkg.version}`);
