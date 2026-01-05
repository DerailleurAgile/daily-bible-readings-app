'use client';

import { useEffect, useState } from 'react';

export default function useVersionCheck({ checkInterval = 60000 } = {}) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [announcement, setAnnouncement] = useState(null);

  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION?.trim();

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        const serverVersion = process.env.NEXT_PUBLIC_TEST_LATEST_VERSION?.trim() || data.version?.trim();

        setLatestVersion(serverVersion);
        setUpdateAvailable(serverVersion !== currentVersion);

        // --- NEW ANNOUNCEMENT LOGIC ---
        if (data.announcement) {
          const dismissedId = localStorage.getItem('dismissed_announcement_id');
          // Only show if the ID in version.json is different from the dismissed one
          if (dismissedId !== data.announcement.id) {
            setAnnouncement(data.announcement);
          } else {
            setAnnouncement(null);
          }
        } else {
          setAnnouncement(null);
        }
        // ------------------------------

      } catch (err) {
        console.warn('Version check failed:', err);
      }
    }

    check();
    const interval = setInterval(check, checkInterval);
    return () => clearInterval(interval);
  }, [checkInterval, currentVersion]);

  // Helper to hide the announcement manually
  const dismissAnnouncement = () => {
    if (announcement?.id) {
      localStorage.setItem('dismissed_announcement_id', announcement.id);
      setAnnouncement(null);
    }
  };

  return { updateAvailable, latestVersion, announcement, dismissAnnouncement };
}