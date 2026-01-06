// hooks/useReadingsForMonth.jsx
import { useState, useEffect } from 'react';

export default function useReadingsForMonth(month) {
  const [readings, setReadings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lectionary JSON version
  // This should be incremented whenever the Lectionary data changes so
  // a new fetch is forced.
  const version = process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v4';
  const storageKey = `readings_${month}_${version}`;

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
        const res = await fetch(`/monthly/${m}.${version}.json`);
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
