'use client';

import { useState } from 'react';
import { Info, Share2, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import packageJson from '../../package.json';
import SlideOver from './SlideOver'; // Reduce, reuse, recyle kids!

export default function AppInfoModal({ isOpen, onClose }) {
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} width="w-80" maxHeight="max-h-[80vh]">
      <h3 className="text-gray-100 font-semibold mb-2 text-center">
        The Daily Office
      </h3>

      <p className="text-sm text-gray-300 text-center mb-4">
        St. Paul's Bloor Street<br/>Lectionary (2025/26) {process.env.NEXT_PUBLIC_LECTIONARY_DATA_VERSION || 'v5'}
        <br />
        <span className="text-xs text-amber-300">
          Version {packageJson.version}
        </span>
      </p>

      <div className="text-xs text-gray-400 space-y-2 mb-4">
        <p className="text-amber-300"><strong>What's New?</strong></p>
        <ul className="list-disc list-outside ml-5 space-y-1">
          <li>Moved this panel out from the settings modal on its own</li>
          <li>Standardized UI with cog for settings and (i) for AppInfo</li>
          <li>Fixed verse citation for June 10th morning reading</li>
          <li>Refactored how modals are handled to better reuse existing components</li>
        </ul>
      </div>

      <div className="text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Chris R. Chapman
      </div>

      {/* Share section */}
      <div className="mt-4">
        <button
          onClick={() => setShowQR((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mx-auto"
        >
          <Share2 className="w-4 h-4" /> Share this App
        </button>

        {showQR && (
          <div className="flex flex-col items-center mt-4">
            <QRCodeCanvas
              value={typeof window !== 'undefined' ? window.location.href : ''}
              size={180}
              bgColor="#1f2937"
              fgColor="#f3f4f6"
              className="block mb-2"
            />
            <p className="text-xs text-gray-400 text-center">
              Scan to open the app on another device.
            </p>
          </div>
        )}
      </div>
    </SlideOver>
  );
}
