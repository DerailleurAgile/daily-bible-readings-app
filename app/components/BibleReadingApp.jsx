'use client';

import React, { useState, useEffect, startTransition } from 'react';
import { Sun, Moon } from 'lucide-react';
import packageJson from '../../package.json';

// Hooks
import useReadingProgress from '../hooks/useReadingProgress';
import useSwipeNavigation from '../hooks/useSwipeNavigation';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import useMobilePlatform from '../hooks/useMobilePlatform';
import useReadingsForMonth from '../hooks/useReadingsForMonth';

// Components
import SettingsPanel from './SettingsPanel';
import SwipeHint from './SwipeHint';
import ReadingSession from './ReadingSession';
import BottomNavigation from './BottomNavigation';
import FeedbackForm from './FeedbackForm';

export function VersionTag() {
  return <span>v {packageJson.version}</span>;
}

export default function BibleReadingApp() {
  // Local date without timezone weirdness
  const getLocalDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const platform = useMobilePlatform();
  const [showFeedback, setShowFeedback] = useState(false);

  // Month cache: { "01": { "01-01": {...}, ... }, "02": {...} }
  const [monthCache, setMonthCache] = useState({});

  // Visible/readings state — don't switch visible readings until new data is ready
  const [displayDateKey, setDisplayDateKey] = useState(() => {
    const d = getLocalDate();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${m}-${dd}`;
  });
  const [displayReadings, setDisplayReadings] = useState(null);

  // Translation preference
  const [translation, setTranslation] = useState('ESV');
  useEffect(() => {
    const saved = localStorage.getItem('bibleTranslation');
    if (saved) setTranslation(saved);
  }, []);
  const handleTranslationChange = (v) => {
    setTranslation(v);
    localStorage.setItem('bibleTranslation', v);
  };

  // === Determine current month ===
  const currentMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');

  // === Lazy-load monthly data via hook (which may consult an in-memory cache or localStorage) ===
  // The hook returns monthReadings for currentMonth when available.
  const { readings: monthReadings, loading, error } = useReadingsForMonth(currentMonth);

  // When monthReadings arrives, stash into monthCache under the month key
  useEffect(() => {
    if (monthReadings) {
      setMonthCache((prev) => {
        // Avoid replacing if identical reference (small optimization)
        if (prev[currentMonth] === monthReadings) return prev;
        return { ...prev, [currentMonth]: monthReadings };
      });
    }
  }, [currentMonth, monthReadings]);

  // === Preload previous + next + current month in background AND update monthCache when fetched ===
  useEffect(() => {
    const monthNum = parseInt(currentMonth, 10);

    const preloadMonths = [
      currentMonth, // ensure current is attempted
      String((monthNum % 12) + 1).padStart(2, '0'),        // next
      String((monthNum + 10) % 12 + 1).padStart(2, '0'),   // previous
    ];

    preloadMonths.forEach((m) => {
      if (monthCache[m]) return; // already in memory

      const key = `readings_${m}_v1`;
      const local = localStorage.getItem(key);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setMonthCache((prev) => ({ ...prev, [m]: parsed }));
          return;
        } catch {
          // fallthrough to fetch if parse fails
        }
      }

      // fetch and store in both localStorage and in-memory cache
      fetch(`/monthly/${m}.v1.json`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to preload month ' + m);
          return res.json();
        })
        .then((data) => {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch {}
          setMonthCache((prev) => ({ ...prev, [m]: data }));
        })
        .catch(() => {
          /* silently ignore preload errors */
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]); // intentionally only depend on currentMonth

  // === Derive date keys ===
  const getDateKey = (date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}-${d}`;
  };
  const dateKey = getDateKey(selectedDate);

  // === Update the visible/displayReadings only when data is available for the selected date ===
  useEffect(() => {
    // If the month is already cached in memory and contains the selected date, show it immediately
    const monthData = monthCache[currentMonth];
    if (monthData && monthData[dateKey]) {
      setDisplayReadings(monthData[dateKey]);
      setDisplayDateKey(dateKey);
      return;
    }

    // If hook provided monthReadings and it contains the date, use it
    if (monthReadings && monthReadings[dateKey]) {
      setDisplayReadings(monthReadings[dateKey]);
      setDisplayDateKey(dateKey);
      return;
    }

    // Otherwise: don't change displayReadings yet — keep showing whatever is currently displayed
    // This prevents the UI from blanking while we wait for the new month to load.
  }, [currentMonth, dateKey, monthCache, monthReadings]);

  // === Reading progress ===
  const { isComplete, toggleComplete } = useReadingProgress();

  // Navigation helpers – using startTransition to avoid visible re-renders
  const goPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    startTransition(() => setSelectedDate(d));
  };

  const goNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    startTransition(() => setSelectedDate(d));
  };

  const resetToToday = () =>
    startTransition(() => setSelectedDate(getLocalDate()));

  // Enable gestures & keyboard support
  useSwipeNavigation({ goNext, goPrev, resetToToday });
  useKeyboardNavigation({ goNext, goPrev, resetToToday });

  // Mobile swipe hint overlay
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const seen = localStorage.getItem('hasSeenSwipeHint');
    if (isMobile && !seen) {
      setShowSwipeHint(true);
      localStorage.setItem('hasSeenSwipeHint', 'true');
      setTimeout(() => setShowSwipeHint(false), 6000);
    }
  }, []);

  // === Hard load screen ONLY if we have no visible data at all (very first load) ===
  if (!displayReadings && loading && Object.keys(monthCache).length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-400">Loading readings...</div>
        </div>
      </div>
    );
  }

  // === Error screen (only if nothing visible) ===
  if (error && !displayReadings) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-red-400 font-semibold mb-2">Error Loading Readings</h2>
          <p className="text-gray-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 pb-24">
      {showSwipeHint && <SwipeHint onClose={() => setShowSwipeHint(false)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-100">Daily Prayer Readings</h1>
          <p className="text-gray-400">St. Paul’s Bloor Street Lectionary (2025)</p>
          <button
            onClick={() => setShowFeedback(true)}
            className="text-blue-400 underline text-sm"
          >
            What do you think of the app?
          </button>
          {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
        </div>

        {/* Settings */}
        <SettingsPanel
          selectedDate={selectedDate}
          setSelectedDate={(d) => startTransition(() => setSelectedDate(d))}
          translation={translation}
          handleTranslationChange={handleTranslationChange}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
        />

        {/* Morning + Evening */}
        {displayReadings ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setActiveSession(activeSession === 'AM' ? null : 'AM')
                }
                className={`p-6 rounded-lg border-2 transition-all ${
                  activeSession === 'AM'
                    ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-gray-900 border-gray-700 hover:border-amber-500/50'
                }`}
              >
                <Sun
                  className={`w-8 h-8 mx-auto mb-2 ${
                    activeSession === 'AM' ? 'text-amber-400' : 'text-gray-400'
                  }`}
                />
                <div className="text-lg font-semibold">Morning</div>
                <div className="text-xs text-gray-400 mt-1">
                  {displayReadings.AM.psalms.length +
                    displayReadings.AM.lesson.length}{' '}
                  readings
                </div>
              </button>

              <button
                onClick={() =>
                  setActiveSession(activeSession === 'PM' ? null : 'PM')
                }
                className={`p-6 rounded-lg border-2 transition-all ${
                  activeSession === 'PM'
                    ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-900 border-gray-700 hover:border-blue-500/50'
                }`}
              >
                <Moon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    activeSession === 'PM' ? 'text-blue-400' : 'text-gray-400'
                  }`}
                />
                <div className="text-lg font-semibold">Evening</div>
                <div className="text-xs text-gray-400 mt-1">
                  {displayReadings.PM.psalms.length +
                    displayReadings.PM.lesson.length}{' '}
                  readings
                </div>
              </button>
            </div>

            {activeSession && displayReadings[activeSession] && (
              <ReadingSession
                sessionKey={activeSession}
                sessionData={displayReadings[activeSession]}
                dateKey={displayDateKey}
                isComplete={isComplete}
                toggleComplete={toggleComplete}
                translation={translation}
              />
            )}
          </>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
            Loading readings for this date...
          </div>
        )}

         {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-6 space-y-2">

          {/* Mobile hint */}
          <div className="text-xs text-amber-400 flex items-center justify-center gap-1 md:hidden">
            <span>💡</span>
            <span>← Swipe → to change days, or double-tap for today</span>
          </div>

          {/* Desktop navigation tip */}
          <div className="pt-2 text-xs text-amber-400 hidden md:block">
            <p>💡 Use ← and → keys to change days, and ↑ to jump back to today</p>
          </div>

          {/* New primary message */}
          <p className="text-gray-300 font-medium">
            This app works best when paired with the <b>YouVersion Bible App.</b>
          </p>

          {/* Platform-based link */}
          {platform === 'ios' && (
            <a
              href="https://apps.apple.com/ca/app/bible/id282935706"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline block"
            >
              Open in the Apple App Store
            </a>
          )}

          {platform === 'android' && (
            <a
              href="https://play.google.com/store/apps/details?id=com.sirma.mobile.bible.android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline block"
            >
              Open in Google Play
            </a>
          )}

          {/* Copyright */}
          <p className="text-gray-600">
            © {new Date().getFullYear()} Chris R. Chapman. All rights reserved.
          </p>

          <VersionTag/>
        </div>

      </div>

      {/* <BottomNavigation goNext={goNext} goPrev={goPrev} /> */}
    </div>
  );
}
