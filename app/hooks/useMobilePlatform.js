'use client';

import { useEffect, useState } from 'react';

export default function useMobilePlatform() {
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  return platform;
}
