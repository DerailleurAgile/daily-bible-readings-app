'use client';

import { useEffect, useState } from 'react';
import { version as bundledVersion } from '../../package.json';

export default function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  // currentVersion is baked into the JS bundle at build time
  const currentVersion = bundledVersion.trim();

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        
        const serverVersion = data.version?.trim();

        const isOutdated = serverVersion !== currentVersion;

        setUpdateAvailable(isOutdated);

        // --- ENFORCED LOGIC SEQUENCE ---
        // If an update is needed, suppress the announcement (Step 1)
        if (isOutdated) {
          setAnnouncement(null);
        } 
        // If app is up-to-date, check for announcement (Step 3)
        else if (data.announcement) {
          const dismissedId = localStorage.getItem('dismissed_announcement_id');
          if (dismissedId !== data.announcement.id) {
            setAnnouncement(data.announcement);
          } else {
            setAnnouncement(null);
          }
        } else {
          setAnnouncement(null);
        }
      } catch (err) {
        console.warn('Version check failed:', err);
      }
    }

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [currentVersion]);

  const dismissAnnouncement = () => {
    if (announcement?.id) {
      localStorage.setItem('dismissed_announcement_id', announcement.id);
      setAnnouncement(null);
    }
  };

  return { updateAvailable, announcement, dismissAnnouncement };
}