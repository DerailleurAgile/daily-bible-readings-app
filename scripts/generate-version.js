const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

const output = {
  version: pkg.version.trim()
};

fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(output, null, 2)
);

console.log(`version.json generated with version = ${pkg.version}`);
