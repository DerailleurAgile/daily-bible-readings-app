'use client';

import { Calendar, Settings, ChevronDown, ChevronUp } from 'lucide-react';

export default function SettingsPanel({
  selectedDate,
  setSelectedDate,
  translation,
  handleTranslationChange,
  settingsOpen,
  setSettingsOpen,
}) {
  const formatDisplayDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const resetToToday = () => {
    const d = new Date();
    const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    setSelectedDate(today);
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">
            {formatDisplayDate(selectedDate)} • {translation}
          </span>
        </div>
        {settingsOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Body */}
      {settingsOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-800 animate-slideDown">
          
          {/* Date Selector */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4" />
                Select Date
              </label>

              <button
                onClick={resetToToday}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Today
              </button>
            </div>

            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) =>
                setSelectedDate(new Date(e.target.value + 'T00:00:00'))
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Translation Selector */}
          <div>
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
              <option value="NRSVUE">
                NRSVUE - NRSV Updated Edition
              </option>
            </select>
          </div>

        </div>
      )}
    </div>
  );
}
