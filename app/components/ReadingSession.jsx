'use client';

// app/components/ReadingSession.jsx
import React from 'react';
import {
  Sun,
  Moon,
  Book,
  BookOpenCheck,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

// Converts a reading record into a Bible.com URL based on translation
function getBibleUrl(reading, translation) {
  const versionMap = {
    'ESV': '59',
    'NIV': '111',
    'KJV': '1',
    'NRSVUE': '3523'
  };

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

  const abbrev =
    abbrevMap[reading.book] || reading.book.toUpperCase().slice(0, 3);

  const version = versionMap[translation] || '59';
  const verses = reading.verses ? `.${reading.verses}` : '';

  return `https://www.bible.com/bible/${version}/${abbrev}.${reading.chapter}${verses}.${translation}`;
}

// Format dateKey (MM-DD) to display format
function formatDateKey(dateKey) {
  const [month, day] = dateKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[parseInt(month, 10) - 1];
  return `${monthName} ${parseInt(day, 10)}`;
}

export default function ReadingSession({
  sessionKey,
  sessionData,
  dateKey,
  isComplete,
  toggleComplete,
  translation,
  selectedYear // NEW! Added selectedYear prop
}) {
  if (!sessionData) return null;

  const icon = sessionKey === 'AM'
    ? <Sun className="w-5 h-5 text-amber-400" />
    : <Moon className="w-5 h-5 text-blue-400" />;

  const label = sessionKey === 'AM' ? 'Morning' : 'Evening';
  const formattedDate = formatDateKey(dateKey);

  // NEW! Passing in selectedYear to isComplete and toggleComplete
  const renderReading = (reading, type) => {
    const completed = isComplete(dateKey, sessionKey, type, reading.reference, selectedYear);

    return (
      <a
        key={reading.reference}
        href={getBibleUrl(reading, translation)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (completed) {
            e.preventDefault();
          }
          toggleComplete(dateKey, sessionKey, type, reading.reference);
        }}
        className={`
          flex items-center justify-between p-3 rounded-lg transition-colors group
          ${completed ? 'bg-green-900/30' : 'bg-gray-800 hover:bg-gray-700'}
        `}
      >
        <div className="flex items-center gap-3">
          {completed ? (
            <BookOpenCheck className="w-4 h-4 text-green-400" />
          ) : (
            <Book className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-gray-100">{reading.reference}</span>
        </div>

        {/* Change icon based on completion status */}
        {completed ? (
          <RotateCcw className="w-4 h-4 text-red-400 group-hover:text-red-300" />
        ) : (
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
        )}
      </a>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold leading-none m-0">
          {label} Readings for {formattedDate}
        </h2>
      </div>

      <div className="space-y-4 animate-fadeIn">
        {/* Psalms */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Psalms
          </h3>

          <div className="space-y-2">
            {sessionData.psalms.map((p) =>
              renderReading(p, 'psalms')
            )}
          </div>
        </div>

        {/* Lessons */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Lesson
          </h3>

          <div className="space-y-2">
            {sessionData.lesson.map((l) =>
              renderReading(l, 'lesson')
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
