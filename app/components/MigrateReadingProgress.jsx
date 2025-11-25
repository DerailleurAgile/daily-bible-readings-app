// app/components/MigrateReadingProgress.jsx
'use client';
import { useEffect } from 'react';
import { migrateReadingProgressIfNeeded } from '@/lib/migrateReadingProgress';

// This is a one-time migration component to be included at the root of the app
// It runs the migration of the user's reading progress from the old dateless format
// to the new format that includes reading activity dates.
export default function MigrateReadingProgress() {
  useEffect(() => {
    migrateReadingProgressIfNeeded();
  }, []);

  return null; // This component renders nothing
}