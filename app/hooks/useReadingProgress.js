'use client';
// app/hooks/useReadingProgress.js
import { useEffect, useState } from 'react';
import { ensureUserSession } from '@/lib/supabaseClient';

// Determine if we're in test mode
const IS_TEST = process.env.NEXT_PUBLIC_ENV !== 'production';

// Get or create device ID (persistent fallback)
function getDeviceId() {
  let id = localStorage.getItem('device_id') || sessionStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
    sessionStorage.setItem('device_id', id);
  } else {
    localStorage.setItem('device_id', id);
    sessionStorage.setItem('device_id', id);
  }
  return id;
}

// Log reading activity via API route
async function logReadingActivity({
  lectionary_date,  // MM-DD format
  session,
  type,
  reference,
  translation,
  action           // 'complete' or 'incomplete'
}) {
  const user = await ensureUserSession();
  const device_id = getDeviceId();

  // fallback to a default translation if undefined
  const finalTranslation = translation ?? 'ESV';

  // activity_date is TODAY
  const today = new Date();
  const activity_date = today.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const response = await fetch('/api/reading/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',       // <-- this allows server to read session cookie
    body: JSON.stringify({
      user_id: user?.id ?? null,  // still optional, mainly fallback
      device_id,
      activity_date,
      lectionary_date,
      session,
      reading_type: type === 'psalms' ? 'psalm' : 'lesson',
      reference,
      translation: finalTranslation,
      action,
      is_test: IS_TEST
    })
  });

    console.log('POST response status:', response.status, 'OK?', response.ok);

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      console.error('API error response body:', errorBody);
    }
  } catch (err) {
    console.error('Network error logging reading:', err);
  }
}

// Custom hook
export default function useReadingProgress(translation) {
  const [completedReadings, setCompletedReadings] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('readingProgress');
    if (saved) {
      try { setCompletedReadings(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readingProgress', JSON.stringify(completedReadings));
  }, [completedReadings]);

  const isComplete = (dateKey, session, type, ref) =>
    completedReadings[dateKey]?.[session]?.[type]?.includes(ref) || false;

  const toggleComplete = async (dateKey, session, type, ref) => {
    const alreadyComplete = isComplete(dateKey, session, type, ref);

    // Update local state first
    setCompletedReadings(prev => {
      const updated = structuredClone(prev);
      updated[dateKey] ||= {};
      updated[dateKey][session] ||= {};
      updated[dateKey][session][type] ||= [];

      const arr = updated[dateKey][session][type];
      const idx = arr.indexOf(ref);

      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(ref);

      return updated;
    });

    const action = alreadyComplete ? 'incomplete' : 'complete';

    await logReadingActivity({
      lectionary_date: dateKey,
      session,
      type,
      reference: ref,
      translation,
      action
    });
  };

  return { completedReadings, isComplete, toggleComplete };
}
