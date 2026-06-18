// lib/migrateReadingProgress.js

const STORAGE_VERSION = 'v2';

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

// Migrate old format to new format with historical date mapping
function migrateProgressData(oldData) {
  const migrated = {};
  const today = new Date();
  const todayStr = getTodayDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  for (const lectionary_date in oldData) {
    const [month, day] = lectionary_date.split('-').map(Number);
    
    let year = currentYear;
    if (month > currentMonth + 1) {
      year = currentYear - 1;
    }
    
    const activity_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // If this is a future date, attribute to today
    const activityDateTime = new Date(activity_date);
    const finalActivityDate = activityDateTime > today ? todayStr : activity_date;
    
    migrated[finalActivityDate] = migrated[finalActivityDate] || {};
    migrated[finalActivityDate][lectionary_date] = oldData[lectionary_date];
  }
  
  console.log('✅ Migrated with future readings attributed to today');
  return migrated;
}

// Migrates reading progress data from old format to new format if needed
// Returns true if migration was performed, false otherwise
export function migrateReadingProgressIfNeeded() {
  if (typeof window === 'undefined') return false;
  
  const versionKey = 'readingProgress_version';
  const currentVersion = localStorage.getItem(versionKey);
  
  // Already migrated
  if (currentVersion === STORAGE_VERSION) {
    return false;
  }
  
  const oldData = localStorage.getItem('readingProgress');
  
  if (!oldData) {
    // No data to migrate, just set version
    localStorage.setItem(versionKey, STORAGE_VERSION);
    return false;
  }
  
  try {
    const parsed = JSON.parse(oldData);
    
    // Check if data is in old format (has MM-DD dates at root level)
    const firstKey = Object.keys(parsed)[0];
    const isOldFormat = firstKey && /^\d{2}-\d{2}$/.test(firstKey);
    
    if (isOldFormat) {
      console.log('🔄 Migrating reading progress to new format with historical dates...');
      const migrated = migrateProgressData(parsed);
      localStorage.setItem('readingProgress', JSON.stringify(migrated));
      localStorage.setItem(versionKey, STORAGE_VERSION);
      console.log('✅ Migration complete');
      return true;
    } else {
      // Already in new format somehow
      localStorage.setItem(versionKey, STORAGE_VERSION);
      return false;
    }
  } catch (err) {
    console.error('❌ Error migrating reading progress:', err);
    console.error('Corrupted data (first 100 chars):', oldData.substring(0, 100));
    
    // Clear corrupted data and start fresh
    console.warn('⚠️ Clearing corrupted reading progress data');
    localStorage.removeItem('readingProgress');
    localStorage.setItem(versionKey, STORAGE_VERSION);
    
    return false;
  }
}