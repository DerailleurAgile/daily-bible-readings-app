'use client';

import { useEffect } from 'react';

export default function useKeyboardNavigation({ goNext, goPrev, resetToToday }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowUp') resetToToday();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, resetToToday]);
}
