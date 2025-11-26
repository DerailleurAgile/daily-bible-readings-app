'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function SwipeHint({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl px-8 py-6 mx-4 shadow-2xl border border-gray-700 animate-fadeIn">
        
        <div className="flex items-center gap-6 text-gray-100 mb-6">
          <div className="flex flex-col items-center animate-swipeLeft">
            <ChevronDown className="w-8 h-8 rotate-90 text-blue-400" />
            <span className="text-sm mt-2">Swipe</span>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">Navigate Days</p>
            <p className="text-sm text-gray-400 mt-1">Swipe left or right</p>
            <p className="text-xs text-gray-500 mt-2">Double-tap to return to today</p>
          </div>

          <div className="flex flex-col items-center animate-swipeRight">
            <ChevronDown className="w-8 h-8 -rotate-90 text-blue-400" />
            <span className="text-sm mt-2">Swipe</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
