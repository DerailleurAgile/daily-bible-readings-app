// hooks/useMonthCache.js
import { useState, useEffect } from 'react';

export default function useMonthCache(currentMonth, monthReadings) {
  const [monthCache, setMonthCache] = useState({});

  useEffect(() => {
  const version = process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v2';

  // First: Old v1 cleanup for those who haven't cleared the old cache yet
  const v1CleanupKey = `cache_cleaned_v1`;
  if (!localStorage.getItem(v1CleanupKey)) {
    for (let i = 1; i <= 12; i++) {
      const month = String(i).padStart(2, '0');
      localStorage.removeItem(`readings_${month}_v1`);
    }
    localStorage.setItem(v1CleanupKey, 'true');
  }

  // 2. Next: Targeted cleanup for known broken files
  const cleanupTarget = async () => {
    try {
      const res = await fetch('/version.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch version.json');
      const { appVersion } = await res.json();
      if (!appVersion) return;

      const cleanupKey = `cache_cleaned_for_${appVersion}`;
      if (localStorage.getItem(cleanupKey)) return;

      // Hardcode the months/files you need re-fetched
      const FILES_TO_RESET = ['12'];

      FILES_TO_RESET.forEach((month) => {
        const key = `readings_${month}_${version}`;
        localStorage.removeItem(key);
      });

      localStorage.setItem(cleanupKey, 'true');
    } catch (err) {
      console.warn('Targeted cleanup failed:', err);
    }
  };

  cleanupTarget();
}, []);


  // Store monthReadings in cache when it arrives
  useEffect(() => {
    if (monthReadings) {
      setMonthCache((prev) => {
        if (prev[currentMonth] === monthReadings) return prev;
        return { ...prev, [currentMonth]: monthReadings };
      });
    }
  }, [currentMonth, monthReadings]);

  // Preload adjacent months for smoother navigation
  useEffect(() => {
    const monthNum = parseInt(currentMonth, 10);
    const preloadMonths = [
      currentMonth,
      String((monthNum % 12) + 1).padStart(2, '0'),
      String((monthNum + 10) % 12 + 1).padStart(2, '0'),
    ];

    preloadMonths.forEach((m) => {
      if (monthCache[m]) return;

      const version = process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v2';
      const key = `readings_${m}_${version}`;
      const local = localStorage.getItem(key);
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