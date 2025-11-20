'use client';

import { useEffect, useState } from 'react';

export default function useVersionCheck({ checkInterval = 60000 } = {}) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);

  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION?.trim();

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        // const serverVersion = data.version?.trim();
        const serverVersion = process.env.NEXT_PUBLIC_TEST_LATEST_VERSION?.trim() || data.version?.trim();

        setLatestVersion(serverVersion);
        setUpdateAvailable(serverVersion !== currentVersion);

        console.log("ENV Current version:", process.env.NEXT_PUBLIC_APP_VERSION);
        console.log("ENV Test latest version:", process.env.NEXT_PUBLIC_TEST_LATEST_VERSION);

        console.log('serverVersion:', serverVersion);
        console.log('currentVersion:', currentVersion);
        console.log('updateAvailable:', serverVersion !== currentVersion);
      } catch (err) {
        console.warn('Version check failed:', err);
      }
    }

    // run immediately
    check();

    // poll
    const interval = setInterval(check, checkInterval);
    return () => clearInterval(interval);
  }, [checkInterval, currentVersion]);

  return { updateAvailable, latestVersion };
}
