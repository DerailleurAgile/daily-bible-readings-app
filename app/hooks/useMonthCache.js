// app/hooks/useMonthCache.js
import { useState, useEffect } from 'react';

const CURRENT_VERSION = process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v4';

export default function useMonthCache(currentMonth, monthReadings) {
  const [monthCache, setMonthCache] = useState({});

  // One-time cleanup: remove old versions
  useEffect(() => {
    const cleanupKey = `cache_cleaned_${CURRENT_VERSION}`;
    
    if (!localStorage.getItem(cleanupKey)) {
      // Remove all old versions
      for (let i = 1; i <= 12; i++) {
        const month = String(i).padStart(2, '0');
        localStorage.removeItem(`readings_${month}_v1`);
        localStorage.removeItem(`readings_${month}_v2`);
        localStorage.removeItem(`readings_${month}_v3`);
        // Future revisions here...
        // It's not the best solution, but it works for now
      }
      localStorage.setItem(cleanupKey, 'true');
      console.log('Cache cleaned for', CURRENT_VERSION);
    }
  }, []);

  // Store current month readings
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
      String((monthNum % 12) + 1).padStart(2, '0'),        // Next month
      String((monthNum + 10) % 12 + 1).padStart(2, '0'),   // Previous month
    ];

    preloadMonths.forEach((m) => {
      const key = `readings_${m}_${CURRENT_VERSION}`;
      const cached = localStorage.getItem(key);

      // If already in memory cache, skip
      if (monthCache[m]) return;

      // If in localStorage, load to memory
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setMonthCache((prev) => ({ ...prev, [m]: parsed }));
          return;
        } catch (e) {
          // Corrupted cache, remove it
          localStorage.removeItem(key);
        }
      }

      // Fetch from server
      const url = `/monthly/${m}.${CURRENT_VERSION}.json`;
      
      fetch(url, {
        // Since files are versioned and immutable, browser cache is fine
        // But we're being explicit for Android
        cache: 'force-cache', // Use browser cache if available
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load month ${m}`);
          return res.json();
        })
        .then((data) => {
          // Save to localStorage
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (e) {
            console.warn('localStorage quota exceeded for', key);
          }
          
          // Save to memory cache
          setMonthCache((prev) => ({ ...prev, [m]: data }));
        })
        .catch((err) => {
          console.error('Failed to preload month', m, err);
        });
    });
  }, [currentMonth, monthCache]);

  return monthCache;
}