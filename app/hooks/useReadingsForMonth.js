// hooks/useReadingsForMonth.jsx
import { useState, useEffect } from 'react';

export default function useReadingsForMonth(month) {
  const [readings, setReadings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Version in your monthly JSON files
  const version = 1;

  const storageKey = `readings_${month}_v${version}`;

  useEffect(() => {
    let cancelled = false;

    async function loadMonth(m) {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setReadings(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/monthly/${m}.v${version}.json`);
        if (!res.ok) throw new Error('Failed to load readings');
        const data = await res.json();
        if (!cancelled) {
          setReadings(data);
          localStorage.setItem(storageKey, JSON.stringify(data));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    setLoading(true);
    loadMonth(month);

    return () => {
      cancelled = true;
    };
  }, [month, storageKey]);

  return { readings, loading, error };
}
