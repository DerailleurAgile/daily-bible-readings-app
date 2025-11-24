// hooks/useMonthCache.js
import { useState, useEffect } from 'react';

export default function useMonthCache(currentMonth, monthReadings) {
  const [monthCache, setMonthCache] = useState({});
  useEffect(() => {
    // v1 Cleanup: Remove all v1 cached months
    if (!localStorage.getItem('cache_cleaned_v1')) {
      for (let i = 1; i <= 12; i++) {
        const month = String(i).padStart(2, '0');
        localStorage.removeItem(`readings_${month}_v1`);
      }
      localStorage.setItem('cache_cleaned_v1', 'true');
    }

    // One-time cleanup for corrected December file
    if (!localStorage.getItem('cache_cleaned_december_fix')) {
      localStorage.removeItem('readings_12_v2');
      localStorage.setItem('cache_cleaned_december_fix', 'true');
    }
  }, []);
    

  // Store current month readings in cache...
  useEffect(() => {
    if (monthReadings) {
      setMonthCache((prev) => {
        if (prev[currentMonth] === monthReadings) return prev;
        return { ...prev, [currentMonth]: monthReadings };
      });
    }
  }, [currentMonth, monthReadings]);

  // Preload previous and next months...
  useEffect(() => {
    const monthNum = parseInt(currentMonth, 10);
    const preloadMonths = [
      currentMonth,
      String((monthNum % 12) + 1).padStart(2, '0'),
      String((monthNum + 10) % 12 + 1).padStart(2, '0'),
    ];

    preloadMonths.forEach((m) => {
      const version = process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v2';
      const key = `readings_${m}_${version}`;
      const local = localStorage.getItem(key);

      // Fetch if monthCache does not exist or storage was cleared
      if (monthCache[m] && local) return;

      if (local) {
        try {
          const parsed = JSON.parse(local);
          setMonthCache((prev) => ({ ...prev, [m]: parsed }));
          return;
        } catch {}
      }

      // Fetch lectionary readings for given month
      fetch(`/monthly/${m}.${version}.json`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to preload month ' + m);
          return res.json();
        })
        .then((data) => {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch {}
          setMonthCache((prev) => ({ ...prev, [m]: data }));
        })
        .catch(() => {});
    });
  }, [currentMonth, monthCache]);

  return monthCache;
}
