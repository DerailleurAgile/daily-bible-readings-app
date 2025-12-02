// app/components/AppHeader.jsx
import { Church, Menu } from 'lucide-react';

export default function AppHeader({ onFeedbackClick, onSettingsClick }) {
  return (
    <div className="relative text-center space-y-2">

      {/* Hamburger menu icon in top-left */}
      <button
        onClick={onSettingsClick}
        className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Centered app icon/title */}
      <Church className="w-10 h-10 mx-auto text-blue-400" />

      <h1 className="text-3xl font-bold text-gray-100">Daily Prayer Readings</h1>
      <p className="text-gray-400">St. Paul's Bloor Street Lectionary (2025)</p>

      <button
        onClick={onFeedbackClick}
        className="text-blue-400 underline text-sm"
      >
        What do you think of the app?
      </button>
    </div>
  );
}