'use client';

import React from 'react';
import { Pointer } from 'lucide-react';

export default function SwipeHint({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-gray-900/95 backdrop-blur-sm rounded-2xl px-8 py-6 mx-4 shadow-2xl border border-gray-700 animate-fadeIn">
        
        {/* Animated finger */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="animate-swipeFinger">
            <Pointer 
              className="w-6 h-6 text-blue-400 drop-shadow-lg" 
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </div>
        </div>

        <div className="text-center text-gray-100 mb-6 relative z-10">
          <p className="text-lg font-semibold">Navigate Days</p>
          <p className="text-sm text-gray-400 mt-1">Swipe left or right</p>
          <p className="text-xs text-gray-500 mt-2">Double-tap to return to today</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors relative z-10"
        >
          Got it!
        </button>
      </div>

      <style jsx>{`
        @keyframes swipeFinger {
          0%, 100% {
            left: 10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          45% {
            left: 85%;
            opacity: 1;
          }
          55% {
            left: 85%;
            opacity: 0;
          }
          65% {
            left: 85%;
            opacity: 0;
            transform: translateY(-50%) scaleX(-1);
          }
          75% {
            opacity: 1;
          }
          90% {
            left: 10%;
            opacity: 1;
            transform: translateY(-50%) scaleX(-1);
          }
          95% {
            opacity: 0;
            transform: translateY(-50%) scaleX(-1);
          }
        }

        .animate-swipeFinger {
          animation: swipeFinger 4s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}