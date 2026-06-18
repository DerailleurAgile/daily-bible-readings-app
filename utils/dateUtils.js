// If dateKey is "12-25", this should format it with the VIEWING year, not current year
export function formatDateKey(dateKey, year = new Date().getFullYear()) {
  const [month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Check if the given date is today
export function isToday(selectedData) {
  const today = new Date();
  return (
    selectedData.getDate() === today.getDate() &&
    selectedData.getMonth() === today.getMonth() &&
    selectedData.getFullYear() === today.getFullYear()
  );
}