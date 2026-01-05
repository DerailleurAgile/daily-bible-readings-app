// components/AnnouncementBanner.jsx
import { X } from 'lucide-react';

export default function AnnouncementBanner({ announcement, onDismiss }) {
  if (!announcement) return null;

  return (
    <div className="relative bg-blue-600/10 border border-blue-500/50 p-3 rounded-lg mb-4 text-blue-100 flex items-center justify-center animate-in slide-in-from-top-2 duration-300">
      
      {/* Centered Content */}
      <div className="text-sm px-8 text-center leading-relaxed">
        <span className="font-bold text-blue-300">
          📢 {announcement.title}
        </span>
        {' '}
        <span>{announcement.message}</span>
      </div>
      
      {/* Dismiss Button - Positioned absolutely to not interfere with centering */}
      <button 
        onClick={onDismiss} 
        className="absolute right-2 text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 p-1 rounded-md transition-all"
        aria-label="Dismiss announcement"
      >
        <X size={18} />
      </button>
    </div>
  );
}