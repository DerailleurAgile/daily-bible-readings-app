'use client';

import { useEffect, useState } from 'react';

export default function useReadingProgress() {
  const [completedReadings, setCompletedReadings] = useState({});

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('readingProgress');
    if (saved) {
      try {
        setCompletedReadings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem('readingProgress', JSON.stringify(completedReadings));
  }, [completedReadings]);

  const isComplete = (dateKey, session, type, ref) => {
    return completedReadings[dateKey]?.[session]?.[type]?.includes(ref) || false;
  };

  const markComplete = (dateKey, session, type, ref) => {
    setCompletedReadings(prev => {
      const updated = structuredClone(prev);
      updated[dateKey] ||= {};
      updated[dateKey][session] ||= {};
      updated[dateKey][session][type] ||= [];

      if (!updated[dateKey][session][type].includes(ref)) {
        updated[dateKey][session][type].push(ref);
      }
      return updated;
    });
  };

  const toggleComplete = (dateKey, session, type, ref) => {
    setCompletedReadings(prev => {
      const updated = structuredClone(prev);
      updated[dateKey] ||= {};
      updated[dateKey][session] ||= {};
      updated[dateKey][session][type] ||= [];

      const arr = updated[dateKey][session][type];
      const i = arr.indexOf(ref);

      i >= 0 ? arr.splice(i, 1) : arr.push(ref);
      return updated;
    });
  };

  return { completedReadings, isComplete, toggleComplete, markComplete };
}
