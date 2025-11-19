import React, { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, Book, ExternalLink } from 'lucide-react';

const BibleReadingApp = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSession, setActiveSession] = useState(null);
  const [translation, setTranslation] = useState('ESV');
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved translation preference on mount
  useEffect(() => {
    const savedTranslation = localStorage.getItem('bibleTranslation');
    if (savedTranslation) {
      setTranslation(savedTranslation);
    }
  }, []);

  // Save translation preference whenever it changes
  const handleTranslationChange = (newTranslation) => {
    setTranslation(newTranslation);
    localStorage.setItem('bibleTranslation', newTranslation);
  };

  // Load readings from public folder on mount
  useEffect(() => {
    fetch('/prayer_readings_2025.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load readings');
        return response.json();
      })
      .then(data => {
        setReadings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading readings:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Format date as MM-DD
  const getDateKey = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // Get Bible.com book abbreviation
  const getBibleComAbbrev = (book) => {
    const abbrevMap = {
      'Psalm': 'PSA',
      'Matthew': 'MAT',
      'Mark': 'MRK',
      'Luke': 'LUK',
      'John': 'JHN',
      'Acts': 'ACT',
      'Romans': 'ROM',
      '1 Corinthians': '1CO',
      '2 Corinthians': '2CO',
      'Galatians': 'GAL',
      'Ephesians': 'EPH',
      'Philippians': 'PHP',
      'Colossians': 'COL',
      '1 Thessalonians': '1TH',
      '2 Thessalonians': '2TH',
      '1 Timothy': '1TI',
      '2 Timothy': '2TI',
      'Titus': 'TIT',
      'Philemon': 'PHM',
      'Hebrews': 'HEB',
      'James': 'JAS',
      '1 Peter': '1PE',
      '2 Peter': '2PE',
      '1 John': '1JN',
      '2 John': '2JN',
      '3 John': '3JN',
      'Jude': 'JUD',
      'Revelation': 'REV'
    };
    return abbrevMap[book] || book.toUpperCase().substring(0, 3);
  };

  // Get Bible version code
  const getVersionCode = (trans) => {
    const versionMap = {
      'ESV': '59',
      'NIV': '111',
      'KJV': '1',
      'NRSVUE': '3523'
    };
    return versionMap[trans] || '59';
  };

  // Generate Bible.com URL
  const getBibleUrl = (reading) => {
    const abbrev = getBibleComAbbrev(reading.book);
    const version = getVersionCode(translation);
    const verses = reading.verses ? `.${reading.verses}` : '';
    return `https://www.bible.com/bible/${version}/${abbrev}.${reading.chapter}${verses}.${translation}`;
  };

  // Show loading state
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

  // Show error state
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

  const dateKey = getDateKey(selectedDate);
  const todayReadings = readings[dateKey];

  const renderReading = (reading) => (
    <a
      key={reading.reference}
      href={getBibleUrl(reading)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Book className="w-4 h-4 text-blue-400" />
        <span className="text-gray-100">{reading.reference}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
    </a>
  );

  const renderSessionReadings = (session, sessionData) => {
    if (!sessionData) return null;

    return (
      <div className="space-y-4 animate-fadeIn">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Psalms
          </h3>
          <div className="space-y-2">
            {sessionData.psalms.map(renderReading)}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Lesson
          </h3>
          <div className="space-y-2">
            {sessionData.lesson.map(renderReading)}
          </div>
        </div>
      </div>
    );
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-100">Daily Prayer Readings</h1>
          <p className="text-gray-400">St. Paul's Bloor Street Lectionary (2025)</p>
        </div>

        {/* Date Picker */}
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4" />
              Select Date
            </label>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Today
            </button>
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-400">{formatDisplayDate(selectedDate)}</p>
        </div>

        {/* Translation Selector */}
        <div className="bg-gray-900 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bible Translation
          </label>
          <select
            value={translation}
            onChange={(e) => handleTranslationChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ESV">ESV - English Standard Version</option>
            <option value="NIV">NIV - New International Version</option>
            <option value="KJV">KJV - King James Version</option>
            <option value="NRSVUE">NRSV - New Revised Standard Version</option>
          </select>
        </div>

        {/* Session Buttons */}
        {todayReadings ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveSession(activeSession === 'AM' ? null : 'AM')}
              className={`p-6 rounded-lg border-2 transition-all ${
                activeSession === 'AM'
                  ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-gray-900 border-gray-700 hover:border-amber-500/50'
              }`}
            >
              <Sun className={`w-8 h-8 mx-auto mb-2 ${
                activeSession === 'AM' ? 'text-amber-400' : 'text-gray-400'
              }`} />
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
              <Moon className={`w-8 h-8 mx-auto mb-2 ${
                activeSession === 'PM' ? 'text-blue-400' : 'text-gray-400'
              }`} />
              <div className="text-lg font-semibold">Evening</div>
              <div className="text-xs text-gray-400 mt-1">
                {todayReadings.PM.psalms.length + todayReadings.PM.lesson.length} readings
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
            No readings available for this date.
          </div>
        )}

        {/* Active Session Readings */}
        {activeSession && todayReadings && (
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              {activeSession === 'AM' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
              <h2 className="text-xl font-semibold">
                {activeSession === 'AM' ? 'Morning' : 'Evening'} Readings
              </h2>
            </div>
            {renderSessionReadings(activeSession, todayReadings[activeSession])}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Click any reading to open in Bible.com or the YouVersion app!</p>
          <p className="text-gray-600">© {new Date().getFullYear()} Chris R. Chapman. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BibleReadingApp;