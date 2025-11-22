// components/AppHeader.jsx
import { Church } from 'lucide-react';

export default function AppHeader({ onFeedbackClick }) {
  return (
    <div className="text-center space-y-2">
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