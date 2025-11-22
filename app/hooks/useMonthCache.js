// hooks/useMonthCache.js
import { useState, useEffect } from 'react';

export default function useMonthCache(currentMonth, monthReadings) {
  const [monthCache, setMonthCache] = useState({});

  // Store monthReadings in cache when it arrives
  useEffect(() => {
    if (monthReadings) {
      setMonthCache((prev) => {
        if (prev[currentMonth] === monthReadings) return prev;
        return { ...prev, [currentMonth]: monthReadings };
      });
    }
  }, [currentMonth, monthReadings]);

  // Preload adjacent months
  useEffect(() => {
    const monthNum = parseInt(currentMonth, 10);
    const preloadMonths = [
      currentMonth,
      String((monthNum % 12) + 1).padStart(2, '0'),
      String((monthNum + 10) % 12 + 1).padStart(2, '0'),
    ];

    preloadMonths.forEach((m) => {
      if (monthCache[m]) return;

      const key = `readings_${m}_v1`;
      const local = localStorage.getItem(key);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setMonthCache((prev) => ({ ...prev, [m]: parsed }));
          return;
        } catch {}
      }

      fetch(`/monthly/${m}.v1.json`)
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