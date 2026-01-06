const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

// Define paths relative to this script's location
const versionPath = path.join(__dirname, '../public/version.json');

function updateVersion() {
  let versionData = {};

  // 1. Try to read the existing public/version.json
  if (fs.existsSync(versionPath)) {
    try {
      const fileContents = fs.readFileSync(versionPath, 'utf8');
      versionData = JSON.parse(fileContents);
      console.log("📖 Existing version.json loaded.");
    } catch (error) {
      console.error("⚠️ Error parsing version.json, starting with fresh object.");
    }
  } else {
    console.log("ℹ️ No version.json found. Creating a new one.");
  }

  // 2. Only overwrite the version key from package.json
  // This preserves "announcement", "name", etc.
  versionData.version = packageJson.version;

  // 3. Write the merged data back to the file
  try {
    fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
    console.log(`✅ Success: Version updated to ${packageJson.version} in public/version.json`);
    
    if (versionData.announcement) {
      console.log(`📣 Announcement preserved: "${versionData.announcement.title}"`);
    }
  } catch (error) {
    console.error("❌ Failed to write version.json:", error);
    process.exit(1);
  }
}

updateVersion();