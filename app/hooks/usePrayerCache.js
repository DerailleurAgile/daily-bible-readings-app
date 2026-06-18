// app/hooks/usePrayerCache.js
import { useState, useEffect } from 'react';

const MANIFEST_URL = '/prayers/manifest.json';

const PRAYER_FILES = [
  'morning-opening',
  'morning-between',
  'morning-closing',
  'evening-opening',
  'evening-between',
  'evening-closing',
];

function getCacheKey(name, hash) {
  return `prayer_${name}_${hash}`;
}

export default function usePrayerCache() {
  const [prayerCache, setPrayerCache] = useState({});

  useEffect(() => {
    fetch(MANIFEST_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch prayer manifest');
        return res.json();
      })
      .then((manifest) => {
        // Evict stale localStorage entries whose hash no longer matches
        const validKeys = new Set(
          Object.entries(manifest).map(([name, hash]) => getCacheKey(name, hash))
        );
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith('prayer_') && !validKeys.has(key)) {
            localStorage.removeItem(key);
          }
        }

        // Load cached entries into memory, collect what's missing
        const initial = {};
        const toFetch = [];

        for (const name of PRAYER_FILES) {
          const hash = manifest[name];
          if (!hash) continue;
          const stored = localStorage.getItem(getCacheKey(name, hash));
          if (stored) {
            initial[name] = stored;
          } else {
            toFetch.push({ name, hash });
          }
        }

        if (Object.keys(initial).length) setPrayerCache(initial);
        if (toFetch.length === 0) return;

        // One-shot: fetch all missing files in parallel
        Promise.all(
          toFetch.map(({ name, hash }) =>
            fetch(`/prayers/${name}.txt`, { cache: 'no-store' })
              .then((res) => {
                if (!res.ok) throw new Error(`Failed to load prayer: ${name}`);
                return res.text();
              })
              .then((text) => {
                try {
                  localStorage.setItem(getCacheKey(name, hash), text);
                } catch {
                  console.warn('localStorage quota exceeded for prayer:', name);
                }
                return [name, text];
              })
              .catch((err) => {
                console.error('Prayer cache fetch failed:', name, err);
                return null;
              })
          )
        ).then((results) => {
          const updates = {};
          for (const result of results) {
            if (result) updates[result[0]] = result[1];
          }
          setPrayerCache((prev) => ({ ...prev, ...updates }));
        });
      })
      .catch((err) => console.error('Prayer manifest fetch failed:', err));
  }, []);

  return prayerCache;
}
