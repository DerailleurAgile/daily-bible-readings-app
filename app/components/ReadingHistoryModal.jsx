// app/components/ReadingHistoryModal.jsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SlideOver from './SlideOver'; // Reduce, reuse, recyle kids!
import useMonthCache from '../hooks/useMonthCache';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// One quadrant per session/type combo, clockwise from top-left
const QUADRANTS = [
  { session: 'AM', type: 'psalms' },
  { session: 'AM', type: 'lesson' },
  { session: 'PM', type: 'psalms' },
  { session: 'PM', type: 'lesson' },
];

export default function ReadingHistoryModal({ isOpen, onClose, isComplete, setSelectedDate }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth(); // 0-based
  const month = String(monthIndex + 1).padStart(2, '0');

  // Loads viewed month (+ adjacent) through the manifest-validated cache
  const { monthCache } = useMonthCache(month);
  const monthData = monthCache[month];

  if (!isOpen) return null;

  const isCurrentMonth =
    year === today.getFullYear() && monthIndex === today.getMonth();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const pageMonth = (delta) =>
    setViewDate(new Date(year, monthIndex + delta, 1));

  const quadrantDone = (dateKey, { session, type }) => {
    const refs = monthData?.[dateKey]?.[session]?.[type];
    if (!refs?.length) return false;
    return refs.every((r) => isComplete(dateKey, session, type, r.reference, year));
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(year, monthIndex, day));
    onClose();
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} width="w-96" maxHeight="max-h-[85dvh]">
      {/* Month pager */}
      <div className="flex items-center justify-between mb-4 pr-8">
        <button
          onClick={() => pageMonth(-1)}
          className="p-2 text-gray-400 hover:text-gray-200"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-gray-100 font-semibold">{monthLabel}</h3>
        <button
          onClick={() => pageMonth(1)}
          disabled={isCurrentMonth}
          className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-500">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateKey = `${month}-${String(day).padStart(2, '0')}`;
          const isFuture =
            isCurrentMonth && day > today.getDate();
          const isToday = isCurrentMonth && day === today.getDate();
          const done = QUADRANTS.map((q) => quadrantDone(dateKey, q));

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isFuture}
              aria-label={`Go to ${monthLabel} ${day}`}
              className={`relative aspect-square rounded overflow-hidden grid grid-cols-2 grid-rows-2
                ${isFuture ? 'opacity-30' : 'active:scale-95 transition-transform'}
                ${isToday ? 'ring-2 ring-amber-400' : ''}`}
            >
              {done.map((d, qi) => (
                <div key={qi} className={d ? 'bg-green-600' : 'bg-gray-800'} />
              ))}
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300 pointer-events-none">
                {day}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1.5 text-xs text-gray-400 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> Read
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm grid grid-cols-2 grid-rows-2 overflow-hidden">
              <span className="bg-green-600" /><span className="bg-gray-800" />
              <span className="bg-gray-800" /><span className="bg-green-600" />
            </span>
            Partial
          </span>
        </div>
        <p className="text-gray-500">Quarters: AM psalm · AM lesson · PM psalm · PM lesson</p>
      </div>
    </SlideOver>
  );
}
