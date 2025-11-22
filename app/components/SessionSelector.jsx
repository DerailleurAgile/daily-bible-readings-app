// components/SessionSelector.jsx
import { Sun, Moon } from 'lucide-react';

export default function SessionSelector({ 
  displayReadings, 
  activeSession, 
  setActiveSession 
}) {
  if (!displayReadings) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setActiveSession(activeSession === 'AM' ? null : 'AM')}
        className={`p-6 rounded-lg border-2 transition-all ${
          activeSession === 'AM'
            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
            : 'bg-gray-900 border-gray-700 hover:border-amber-500/50'
        }`}
      >
        <Sun
          className={`w-8 h-8 mx-auto mb-2 ${
            activeSession === 'AM' ? 'text-amber-400' : 'text-gray-400'
          }`}
        />
        <div className="text-lg font-semibold">Morning</div>
        <div className="text-xs text-gray-400 mt-1">
          {displayReadings.AM.psalms.length + displayReadings.AM.lesson.length} readings
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
        <Moon
          className={`w-8 h-8 mx-auto mb-2 ${
            activeSession === 'PM' ? 'text-blue-400' : 'text-gray-400'
          }`}
        />
        <div className="text-lg font-semibold">Evening</div>
        <div className="text-xs text-gray-400 mt-1">
          {displayReadings.PM.psalms.length + displayReadings.PM.lesson.length} readings
        </div>
      </button>
    </div>
  );
}