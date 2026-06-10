'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Info, X, Smartphone } from 'lucide-react';

export default function SettingsPanel({
  selectedDate,
  setSelectedDate,
  translation,
  handleTranslationChange,
  setSettingsOpen, // Keep this to close from within
  onShowAppInfo, // New prop to open the App Info modal
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
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

  // Get device ID on mount
  useEffect(() => {
    const id = localStorage.getItem('device_id') || 'Not found';
    setDeviceId(id);
  }, []);

  // Copy device ID to clipboard
  const copyDeviceId = async () => {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopiedDeviceId(true);
      setTimeout(() => setCopiedDeviceId(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // NEW! Handle "Install to Home Screen" click NEW!
  const handleReInstallClick = () => {
    // Clear the dismiss flag so the prompt can show again
    localStorage.removeItem('pwa-install-dismissed');
    
    // Refresh the page to re-trigger beforeinstallprompt event
    window.location.reload();
    
    setSettingsOpen(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Settings</h2>
        <p className="text-sm text-gray-400">
          {formatDisplayDate(selectedDate)} • {translation}
        </p>
      </div>

      {/* Date Selector */}
      <div className="space-y-3">
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
        <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-2">
          Bible Translation

          {/* Info icon */}
          <div className="relative">
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
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-md p-3 shadow-xl z-50 animate-fadeIn">
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
      </div>

      {/* Device ID for debugging */}
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Smartphone className="w-3 h-3" />
            Device ID (for support)
          </label>
          <button
            onClick={copyDeviceId}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {copiedDeviceId ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <code className="text-xs text-gray-300 font-mono break-all block">
          {deviceId}
        </code>
      </div>

      {/* New: Install to Home Screen button */}
      <button
        onClick={handleReInstallClick}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <Smartphone className="w-5 h-5" />
        Install to Home Screen
      </button>

      {/* About App button */}
      <button
        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
        onClick={onShowAppInfo}
      >
        <Info className="w-4 h-4" /> About This App
      </button>

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}