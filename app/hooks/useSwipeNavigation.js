// hooks/useSwipeNavigation.js - Custom hook for swipe navigation with double-tap to reset

'use client';

import { useEffect } from 'react';

export default function useSwipeNavigation({ goNext, goPrev, resetToToday }) {
  useEffect(() => {
    let touchStart = 0;
    let touchEnd = 0;
    let lastTap = 0;

    const handleStart = (e) => {
      if (e.target.closest('[data-modal]')) return; // Ignore swipes on modals
      touchStart = e.changedTouches[0].screenX;
    };

    const handleEnd = (e) => {
      if (e.target.closest('[data-modal]')) return;
      touchEnd = e.changedTouches[0].screenX;

      // Double tap → today
      const now = Date.now();
      if (now - lastTap < 300) {
        if (resetToToday){
            resetToToday();
        }
        lastTap = 0;
        return;
      }
      lastTap = now;

      const diff = touchStart - touchEnd;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goNext() : goPrev();
      }
    };

    document.addEventListener('touchstart', handleStart);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('touchstart', handleStart);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [goNext, goPrev, resetToToday]);
}
