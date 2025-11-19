'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function BottomNavigation({ goPrev, goNext }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
        
        <button
          onClick={goPrev}
          className="
            flex-1 max-w-[160px] flex items-center justify-center gap-2 px-6 py-3
            bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-100 active:scale-95
          "
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          <span className="font-medium">Previous</span>
        </button>

        <button
          onClick={goNext}
          className="
            flex-1 max-w-[160px] flex items-center justify-center gap-2 px-6 py-3
            bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-100 active:scale-95
          "
        >
          <span className="font-medium">Next</span>
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>

      </div>
    </div>
  );
}
