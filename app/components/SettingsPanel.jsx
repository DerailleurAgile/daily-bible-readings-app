'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Settings, ChevronDown, ChevronUp, Info, Share2, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function SettingsPanel({
  selectedDate,
  setSelectedDate,
  translation,
  handleTranslationChange,
  settingsOpen,
  setSettingsOpen,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const tooltipTimeoutRef = useRef(null);
  const containerRef = useRef(null);

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

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 5000);
    }
    return () => clearTimeout(tooltipTimeoutRef.current);
  }, [showTooltip]);

  // Hide tooltip if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="relative" ref={containerRef}>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-1">
              Bible Translation

              {/* Info icon - mobile only */}
              <div className="relative block md:hidden">
                <button
                  type="button"
                  className="p-1"
                  onClick={() => setShowTooltip((prev) => !prev)}
                  aria-label="Translation info"
                >
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                </button>

                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-md p-3 shadow-xl z-50 opacity-0 animate-fadeIn">
                    Make sure to download the selected translation in your Bible.com app!
                  </div>
                )}
              </div>
            </label>

            <select
              value={translation}
              onChange={(e) => handleTranslationChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ESV">ESV - English Standard Version</option>
              <option value="NIV">NIV - New International Version</option>
              <option value="KJV">KJV - King James Version</option>
              <option value="NRSVUE">NRSVUE - NRSV Updated Edition</option>
            </select>

            {/* Share QR button */}
            <button
              className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              onClick={() => setShowQR(true)}
            >
              <Share2 className="w-4 h-4" /> Share App
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 relative w-80 text-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowQR(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-gray-100 font-semibold mb-4">Share this app</h3>
            <QRCodeCanvas
              value={typeof window !== 'undefined' ? window.location.href : ''}
              size={200}
              bgColor="#1f2937"
              fgColor="#f3f4f6"
            />
            <p className="text-xs text-gray-400 mt-2">
              Scan the QR code to open the app on your device.
            </p>
          </div>
        </div>
      )}

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
