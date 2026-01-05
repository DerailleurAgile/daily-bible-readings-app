// components/AnnouncementBanner.jsx
import { Megaphone, X } from 'lucide-react';

export default function AnnouncementBanner({ announcement, onDismiss }) {
  if (!announcement) return null;

  return (
    <div className="bg-blue-600/10 border border-blue-500/50 p-3 rounded-lg mb-4 text-blue-100 flex justify-between items-center animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 flex-1">
        <div className="bg-blue-500/20 p-1.5 rounded-full shrink-0">
          <Megaphone size={16} className="text-blue-400" />
        </div>
        <div className="text-sm">
          <span className="font-bold text-blue-300 mr-1">
            {announcement.title}:
          </span>
          {announcement.message}
        </div>
      </div>
      
      <button 
        onClick={onDismiss} 
        className="text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 p-1 rounded-md transition-all ml-2"
        aria-label="Dismiss announcement"
      >
        <X size={18} />
      </button>
    </div>
  );
}