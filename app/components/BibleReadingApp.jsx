'use client';

import { useEffect, useState } from 'react';
import packageJson from '../../package.json';

// Hooks
import useAppVersionCheck from '../hooks/useAppVersionCheck'; // Updated to return announcement
import useDateNavigation from '../hooks/useDateNavigation';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import useMobilePlatform from '../hooks/useMobilePlatform';
import useMonthCache from '../hooks/useMonthCache';
import useReadingProgress from '../hooks/useReadingProgress';
import useReadingsForMonth from '../hooks/useReadingsForMonth';
import useSwipeNavigation from '../hooks/useSwipeNavigation';

// Components
import AppFooter from './AppFooter';
import AppHeader from './AppHeader';
import FeedbackForm from './FeedbackForm';
import ReadingSession from './ReadingSession';
import SessionSelector from './SessionSelector';
import SettingsPanelModal from './SettingsPanelModal';
import AppInfoModal from './AppInfoModal'; // New for v1.1.4!
import SwipeHint from './SwipeHint';
import UpdateBanner from './UpdateBanner';
import AnnouncementBanner from './AnnouncementBanner'; // New Component
import SlideOver from './SlideOver';
import PWAInstallPrompt from './PWAInstallPrompt';

export function VersionTag() {
  return <span>v {packageJson.version}</span>;
}

export default function BibleReadingApp() {
  // Local date without timezone weirdness
  const getLocalDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  // --- VERSION & ANNOUNCEMENT LOGIC ---
  const { 
    updateAvailable, 
    announcement, 
    dismissAnnouncement 
  } = useAppVersionCheck();

  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const platform = useMobilePlatform();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Visible/readings state
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

  // Determine current month
  const currentMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');

  // Lazy-load monthly data
  const { readings: monthReadings, loading, error } = useReadingsForMonth(currentMonth);

  // Month caching with preloading
  const monthCache = useMonthCache(currentMonth, monthReadings);

  // Derive date keys
  const getDateKey = (date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}-${d}`;
  };
  const dateKey = getDateKey(selectedDate);

  // Update visible readings when data is available
  useEffect(() => {
    const monthData = monthCache[currentMonth];
    if (monthData && monthData[dateKey]) {
      setDisplayReadings(monthData[dateKey]);
      setDisplayDateKey(dateKey);
      return;
    }

    if (monthReadings && monthReadings[dateKey]) {
      setDisplayReadings(monthReadings[dateKey]);
      setDisplayDateKey(dateKey);
    }
  }, [currentMonth, dateKey, monthCache, monthReadings]);

  // Reading progress with explanation cache
  const { isComplete, toggleComplete, getExplanation, saveExplanation } = useReadingProgress(translation);

  // Navigation
  const { goPrev, goNext, resetToToday } = useDateNavigation(selectedDate, setSelectedDate, getLocalDate);

  // Enable gestures & keyboard support
  useSwipeNavigation({ goNext, goPrev, resetToToday });
  useKeyboardNavigation({ goNext, goPrev, resetToToday });

  // Mobile swipe hint overlay
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const seen = localStorage.getItem('hasSeenSwipeHint');
    if (isMobile && !seen) {
      setShowSwipeHint(true);
      localStorage.setItem('hasSeenSwipeHint', 'true');
      setTimeout(() => setShowSwipeHint(false), 6000);
    }
  }, []);

  // Loading screen
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

  // Error screen
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

  // Main render
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 pb-24">
      {/* 1. System Updates (Yellow) */}
      <UpdateBanner updateAvailable={updateAvailable} />

      {/* 2. Feature Announcements (Blue) */}
      {!updateAvailable && announcement && (
        <AnnouncementBanner 
          announcement={announcement} 
           onDismiss={dismissAnnouncement} 
        />
        )
      }

      <PWAInstallPrompt />

      {showSwipeHint && <SwipeHint onClose={() => setShowSwipeHint(false)} />}

      <AppInfoModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      <div className="max-w-2xl mx-auto space-y-6 relative">
        <AppHeader
          dateKey={displayDateKey}
          selectedDate={selectedDate} // NEW!  
          onFeedbackClick={() => setShowFeedback(true)} 
          onSettingsClick={() => setSettingsOpen(true)}
          onInfoClick={() => setShowAbout(true)}  
        />
        {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}

        <SlideOver isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}>
          <SettingsPanelModal
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            translation={translation}
            handleTranslationChange={handleTranslationChange}
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
          />
        </SlideOver>
        
        <SessionSelector
          displayReadings={displayReadings}
          activeSession={activeSession}
          setActiveSession={setActiveSession}
        />

        {activeSession && displayReadings?.[activeSession] && (
          <ReadingSession
            sessionKey={activeSession}
            sessionData={displayReadings[activeSession]}
            dateKey={displayDateKey}
            isComplete={isComplete}
            toggleComplete={toggleComplete}
            translation={translation}
            selectedYear={selectedDate.getFullYear()}
            getExplanation={getExplanation}
            saveExplanation={saveExplanation}
          />
        )}

        {!displayReadings && (
          <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
            Loading readings for this date...
          </div>
        )}

        <AppFooter platform={platform} />
      </div>
    </div>
  );
}