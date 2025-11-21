'use client';

import { useEffect, useState } from 'react';

// Determine if we're in test mode
const IS_TEST = process.env.NEXT_PUBLIC_ENV !== 'production';

// Get or create device ID (more persistent version)
function getDeviceId() {
  // Try localStorage first
  let id = localStorage.getItem('device_id');
  
  // Fallback to sessionStorage if localStorage cleared
  if (!id) {
    id = sessionStorage.getItem('device_id');
  }
  
  // Generate new if both are empty
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
    sessionStorage.setItem('device_id', id);
  } else {
    // Restore to both storages if found in one
    localStorage.setItem('device_id', id);
    sessionStorage.setItem('device_id', id);
  }
  
  return id;
}

// Log reading activity via API route
async function logReadingActivity({
  lectionary_date,  // MM-DD format - which reading from the lectionary
  session,
  type,
  reference,
  translation,
  action            // 'complete' or 'incomplete'
}) {
  const device_id = getDeviceId();
  
  // activity_date is TODAY (when they're actually doing it)
  const today = new Date();
  const activity_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  try {
    const response = await fetch('/api/reading/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id,
        activity_date,      // When they did it (YYYY-MM-DD)
        lectionary_date,    // Which reading (MM-DD)
        session,
        reading_type: type === 'psalms' ? 'psalm' : 'lesson',
        reference,
        translation,
        action,              // 'complete' or 'incomplete'
        is_test: IS_TEST     // Flag for test mode
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API error:', error);
    }
  } catch (err) {
    console.error('Network error logging reading:', err);
  }
}

// Custom hook to manage reading progress
export default function useReadingProgress(translation) {
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

  // Toggle completion
  const toggleComplete = async (dateKey, session, type, ref) => {
    const alreadyComplete = isComplete(dateKey, session, type, ref);

    // Update local state
    setCompletedReadings(prev => {
      const updated = structuredClone(prev);
      updated[dateKey] ||= {};
      updated[dateKey][session] ||= {};
      updated[dateKey][session][type] ||= [];

      const arr = updated[dateKey][session][type];
      const idx = arr.indexOf(ref);

      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(ref);
      }

      return updated;
    });

    // Determine action based on current state
    const action = alreadyComplete ? 'incomplete' : 'complete';

    await logReadingActivity({
      lectionary_date: dateKey,  // MM-DD format
      session,
      type,
      reference: ref,
      translation,
      action
    });
  };

  return { completedReadings, isComplete, toggleComplete };
}