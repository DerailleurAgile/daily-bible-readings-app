// splitByMonthWithVersion.ts
import fs from 'fs';
import path from 'path';

// === CONFIG ===
const inputFile = path.resolve('./data/prayer_readings_2025.json'); // path to your original JSON
const outputDir = path.resolve('./public/monthly'); // folder to write monthly files
const version = 1; // increment this whenever the readings update

// === SETUP ===
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// === READ JSON ===
const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// === GROUP BY MONTH ===
const months: Record<string, Record<string, unknown>> = {};

for (const dateKey of Object.keys(data)) {
  const [month, day] = dateKey.split('-');
  if (!months[month]) months[month] = {};
  months[month][dateKey] = data[dateKey];
}

// === WRITE MONTHLY FILES ===
for (const [month, readings] of Object.entries(months)) {
  const fileName = `${month}.v${version}.json`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(readings, null, 2), 'utf-8');
  console.log(`Written month ${month}: ${fileName}`);
}

console.log('All months written successfully!');
