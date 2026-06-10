// app/components/AppHeader.jsx
import { Church, Menu, Info, Settings } from 'lucide-react';
import { formatDateKey } from '../../utils/dateUtils'
import { isToday } from '../../utils/dateUtils';

export default function AppHeader({ dateKey, selectedDate, onFeedbackClick, onSettingsClick, onInfoClick }) {
  const dateIsToday = isToday(selectedDate);
  return (
    <div className="relative text-center space-y-2">
      <button
        onClick={onSettingsClick}
        className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Settings className="w-6 h-6" />
      </button>
      <button
        onClick={onInfoClick}
        className="absolute top-0 right-0 p-2 text-gray-300 hover:text-white transition-colors"
        aria-label="About this app"
      >
        <Info className="w-6 h-6" />
      </button>

      <Church className="w-10 h-10 mx-auto text-blue-400" />

      <h1 className="text-3xl font-bold text-gray-100">The Daily Office</h1>
      <p className="text-gray-400">St. Paul's Bloor Street Lectionary (2025/26)</p>

      <h2 className={`text-xl font-bold flex items-center justify-center gap-3 ${dateIsToday ? 'text-amber-400' : 'text-gray-300'}`}>
        <span className="text-gray-500 text-2xl transform scale-x-[-1]">〜</span>
          {formatDateKey(dateKey, selectedDate.getFullYear())}
        <span className="text-gray-500 text-2xl">〜</span>
      </h2>

    </div>
  );
}