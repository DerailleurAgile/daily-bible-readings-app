'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, Book, ExternalLink, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import packageJson from '../../package.json';

// Hooks
import useReadingProgress from '../hooks/useReadingProgress';
import useSwipeNavigation from '../hooks/useSwipeNavigation';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import useMobilePlatform from '../hooks/useMobilePlatform';

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

  // Feedback form state
  const [showFeedback, setShowFeedback] = useState(false);

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

  // Load lectionary JSON
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const todayReadings = readings[dateKey];

  useEffect(() => {
    fetch('/prayer_readings_2025.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load readings');
        return res.json();
      })
      .then((data) => {
        setReadings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Reading progress
  const { isComplete, toggleComplete } = useReadingProgress();

  // Navigation helpers
  const goPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const resetToToday = () => {
    setSelectedDate(getLocalDate());
  };

  // Enable gestures & keyboard support
  useSwipeNavigation({ goNext, goPrev, resetToToday });
  useKeyboardNavigation({ goNext, goPrev });

  // Mobile swipe hint overlay
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Show once on first visit on mobile with 6s timeout
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const seen = localStorage.getItem('hasSeenSwipeHint');

    if (isMobile && !seen) {
      setShowSwipeHint(true);
      localStorage.setItem('hasSeenSwipeHint', 'true');
      setTimeout(() => setShowSwipeHint(false), 6000);
    }
  }, []);

  // Helpers
  const getDateKey = (date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}-${d}`;
  };

  const dateKey = getDateKey(selectedDate);
  const todayReadings = readings[dateKey];

  // States
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-400">Loading readings...</div>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 pb-24">

      {/* Swipe hint overlay */}
      {showSwipeHint && (
        <SwipeHint onClose={() => setShowSwipeHint(false)} />
      )}

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
          {/* Render FeedbackForm when showFeedback is true */}
          {showFeedback && (
            <FeedbackForm onClose={() => setShowFeedback(false)} />
          )}
        </div>

        {/* Settings panel */}
        <SettingsPanel
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          translation={translation}
          handleTranslationChange={handleTranslationChange}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
        />

        {/* Morning + Evening */}
                {todayReadings ? (
          <>
            {/* AM/PM toggle buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveSession(activeSession === 'AM' ? null : 'AM')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  activeSession === 'AM'
                    ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-gray-900 border-gray-700 hover:border-amber-500/50'
                }`}
              >
                <Sun className={`w-8 h-8 mx-auto mb-2 ${activeSession === 'AM' ? 'text-amber-400' : 'text-gray-400'}`} />
                <div className="text-lg font-semibold">Morning</div>
                <div className="text-xs text-gray-400 mt-1">
                  {todayReadings.AM.psalms.length + todayReadings.AM.lesson.length} readings
                </div>
              </button>

              <button
                onClick={() => setActiveSession(activeSession === 'PM' ? null : 'PM')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  activeSession === 'PM'
                    ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-900 border-gray-700 hover:border-blue-500/50'
                }`}
              >
                <Moon className={`w-8 h-8 mx-auto mb-2 ${activeSession === 'PM' ? 'text-blue-400' : 'text-gray-400'}`} />
                <div className="text-lg font-semibold">Evening</div>
                <div className="text-xs text-gray-400 mt-1">
                  {todayReadings.PM.psalms.length + todayReadings.PM.lesson.length} readings
                </div>
              </button>
            </div>

            {/* Only render the active session below the buttons */}
            {activeSession && todayReadings[activeSession] && (
              <ReadingSession
                sessionKey={activeSession}
                sessionData={todayReadings[activeSession]}
                dateKey={dateKey}
                isComplete={isComplete}
                toggleComplete={toggleComplete}
                translation={translation}
              />
            )}
          </>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
            No readings for this date.
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-6 space-y-3">

          {/* Mobile hint */}
          <div className="text-xs text-amber-400 flex items-center justify-center gap-1 md:hidden">
            <span>💡</span>
            <span>Swipe ← → to change days, double-tap for today</span>
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

          {/* Desktop navigation tip */}
          <div className="pt-2 text-xs text-gray-600 hidden md:block">
            <p>💡 Use ← and → arrow keys to navigate days</p>
          </div>

          <VersionTag/>
        </div>

      </div>

      {/* Bottom fixed navigation */}
      <BottomNavigation goNext={goNext} goPrev={goPrev} />

      {/* CSS Animations (kept locally) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes swipeLeft {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(-20px); opacity: 0.5; }
        }

        .animate-swipeLeft {
          animation: swipeLeft 1.5s ease-in-out infinite;
        }

        @keyframes swipeRight {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(20px); opacity: 0.5; }
        }

        .animate-swipeRight {
          animation: swipeRight 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
