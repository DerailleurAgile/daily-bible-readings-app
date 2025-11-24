// hooks/useMonthCache.js
import { useState, useEffect } from 'react';

export default function useMonthCache(currentMonth, monthReadings) {
  const [monthCache, setMonthCache] = useState({});

  // One-time cleanup of old v1 cache
  useEffect(() => {
    const version = process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v2';
    const cleanupKey = `cache_cleaned_${version}`;
    const cleaned = localStorage.getItem(cleanupKey);
    
    if (!cleaned) {
      // Remove all old v1 cached months
      for (let i = 1; i <= 12; i++) {
        const month = String(i).padStart(2, '0');
        localStorage.removeItem(`readings_${month}_v1`);
      }
      localStorage.setItem(cleanupKey, 'true');
    }
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