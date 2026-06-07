'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  BookOpenCheck,
  ExternalLink,
  RotateCcw,
  MessageCircleQuestionMark
} from 'lucide-react';
import ClosedBookWithCross from './ClosedBookWithCross';
import ReadingExplanationModal from './ReadingExplanationModal';
import PrayerModal from './PrayerModal';
import { formatDateKey } from '../../utils/dateUtils';


// Converts a reading record into a Bible.com URL based on translation
function getBibleUrl(reading, translation) {
  const versionMap = {
    'ESV': '59',
    'NIV': '111',
    'KJV': '1',
    'NRSVUE': '3523',
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

export default function ReadingSession({
  sessionKey,
  sessionData,
  dateKey,
  isComplete,
  toggleComplete,
  translation,
  selectedYear,
  getExplanation,
  saveExplanation
}) {
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState('');

  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [prayerPosition, setPrayerPosition] = useState(null);

  if (!sessionData) return null;

  const icon = sessionKey === 'AM'
    ? <Sun className="w-5 h-5 text-amber-400" />
    : <Moon className="w-5 h-5 text-blue-400" />;

  const label = sessionKey === 'AM' ? 'Morning' : 'Evening';
  const formattedDate = formatDateKey(dateKey);

  const handleInfoClick = (e, reference) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedReference(reference);
    setExplanationModalOpen(true);
  };

  const handlePrayerClick = (position) => {
    setPrayerPosition(position);
    setPrayerModalOpen(true);
  };

  const prayerButtonClass = `
    p-1.5 rounded-md transition-colors text-gray-500 hover:text-amber-400
    hover:bg-amber-900/30 text-base leading-none
  `;

  const renderReading = (reading, type) => {
    const completed = isComplete(dateKey, sessionKey, type, reading.reference, selectedYear);

    return (
      <div
        key={reading.reference}
        className="flex items-center gap-2"
      >
        <a
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
            flex items-center justify-between p-3 rounded-lg transition-colors group flex-1
            ${completed ? 'bg-green-900/30' : 'bg-gray-800 hover:bg-gray-700'}
          `}
        >
          <div className="flex items-center gap-3">
            {completed ? (
              <BookOpenCheck className="w-6 h-6 text-green-400" />
            ) : (
              <ClosedBookWithCross className="w-6 h-6 text-blue-400" />
            )}
            <span className="text-gray-100">{reading.reference}</span>
          </div>

          {completed ? (
            <RotateCcw className="w-6 h-6 text-red-400 group-hover:text-red-300" />
          ) : (
            <ExternalLink className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
          )}
        </a>

        {/* AI Explanation Button */}
        <button
          onClick={(e) => handleInfoClick(e, reading.reference)}
          className="p-3 bg-gray-800 hover:bg-blue-900/50 rounded-lg transition-colors group"
          aria-label={`Explain ${reading.reference}`}
        >
          <MessageCircleQuestionMark className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold leading-none m-0">
            {label} Readings
          </h2>
        </div>

        <div className="space-y-4 animate-fadeIn">

          {/* Opening prayer divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-gray-800" />
            <button
              onClick={() => handlePrayerClick('opening')}
              className={`${prayerButtonClass} flex items-center gap-1.5 text-xs font-sans tracking-wide`}
              aria-label="Opening prayer"
              title="Opening prayer"
            >
              <span>🙏</span>
              <span className="text-gray-600 hover:text-amber-400 transition-colors">
                opening prayer
              </span>
            </button>
            <div className="flex-1 border-t border-gray-800" />
          </div>

          {/* Psalms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Psalms
              </h3>
            </div>
            <div className="space-y-2">
              {sessionData.psalms.map((p) => renderReading(p, 'psalms'))}
            </div>
          </div>

          {/* Between divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-gray-800" />
            <button
              onClick={() => handlePrayerClick('between')}
              className={`${prayerButtonClass} flex items-center gap-1.5 text-xs font-sans tracking-wide`}
              aria-label="Prayer after psalms, before lesson"
              title="Prayer after psalms, before lesson"
            >
              <span>🙏</span>
              <span className="text-gray-600 hover:text-amber-400 transition-colors">
                after psalms, before lesson
              </span>
            </button>
            <div className="flex-1 border-t border-gray-800" />
          </div>

          {/* Lesson */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Lesson
              </h3>
            </div>
            <div className="space-y-2">
              {sessionData.lesson.map((l) => renderReading(l, 'lesson'))}
            </div>
          </div>

          {/* Closing prayer */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 border-t border-gray-800" />
            <button
              onClick={() => handlePrayerClick('closing')}
              className={`${prayerButtonClass} flex items-center gap-1.5 text-xs font-sans tracking-wide`}
              aria-label="Post-Lesson prayers"
              title="Post-Lesson prayers"
            >
              <span>🙏</span>
              <span className="text-gray-600 hover:text-amber-400 transition-colors">
                after lesson prayers
              </span>
            </button>
            <div className="flex-1 border-t border-gray-800" />
          </div>

        </div>
      </div>

      <ReadingExplanationModal
        reference={selectedReference}
        isOpen={explanationModalOpen}
        onClose={() => setExplanationModalOpen(false)}
        getExplanation={getExplanation}
        saveExplanation={saveExplanation}
      />

      <PrayerModal
        isOpen={prayerModalOpen}
        onClose={() => setPrayerModalOpen(false)}
        session={sessionKey}
        position={prayerPosition}
      />
    </>
  );
}