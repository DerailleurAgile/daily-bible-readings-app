// app/hooks/useMonthCache.js
import { useState, useEffect, useRef } from 'react';

const MANIFEST_URL = '/monthly/manifest.json';

async function fetchManifest() {
  const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch lectionary manifest');
  return res.json();
}

function getCacheKey(month, hash) {
  return `readings_${month}_${hash}`;
}

export default function useMonthCache(currentMonth) {
  const [monthCache, setMonthCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const manifestRef = useRef(null); // { "01": "a3f9c2", ... }

  // On mount: fetch manifest, evict stale entries, load valid ones
  useEffect(() => {
    fetchManifest()
      .then((manifest) => {
        manifestRef.current = manifest;

        // Evict any localStorage entry not matching current manifest hashes
        const validKeys = new Set(
          Object.entries(manifest).map(([m, hash]) => getCacheKey(m, hash))
        );
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith('readings_') && !validKeys.has(key)) {
            localStorage.removeItem(key);
          }
        }

        // Prime memory cache from localStorage for any month already stored
        const initial = {};
        for (const [month, hash] of Object.entries(manifest)) {
          const stored = localStorage.getItem(getCacheKey(month, hash));
          if (stored) {
            try {
              initial[month] = JSON.parse(stored);
            } catch {
              localStorage.removeItem(getCacheKey(month, hash));
            }
          }
        }
        setMonthCache(initial);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Manifest fetch failed:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Preload current + adjacent months
  useEffect(() => {
    const manifest = manifestRef.current;
    if (!manifest) return; // Wait for manifest to load

    const monthNum = parseInt(currentMonth, 10);
    const targets = [
      currentMonth,
      String((monthNum % 12) + 1).padStart(2, '0'),
      String((monthNum + 10) % 12 + 1).padStart(2, '0'),
    ];

    targets.forEach((m) => {
      if (monthCache[m]) return; // Already in memory

      const hash = manifest[m];
      if (!hash) return; // Month not in manifest (shouldn't happen)

      const key = getCacheKey(m, hash);
      const stored = localStorage.getItem(key);

      if (stored) {
        try {
          setMonthCache((prev) => ({ ...prev, [m]: JSON.parse(stored) }));
          return;
        } catch {
          localStorage.removeItem(key);
        }
      }

      fetch(`/monthly/${m}.json`, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load month ${m}`);
          return res.json();
        })
        .then((data) => {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch {
            console.warn('localStorage quota exceeded for', key);
          }
          setMonthCache((prev) => ({ ...prev, [m]: data }));
        })
        .catch((err) => console.error('Failed to preload month', m, err));
    });
  }, [currentMonth, monthCache]);

  return { monthCache, loading, error };
}