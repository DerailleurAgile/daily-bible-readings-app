'use client';

import { useState } from 'react';
import { Info, Share2, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import packageJson from '../../package.json';
import SlideOver from './SlideOver'; // Reduce, reuse, recyle kids!

export default function AppInfoModal({ isOpen, onClose }) {
  const [showQR, setShowQR] = useState(false);

  const platform = typeof navigator !== 'undefined'
    ? /ipad|iphone|ipod/i.test(navigator.userAgent) ? 'ios'
    : /android/i.test(navigator.userAgent) ? 'android'
    : 'other'
    : 'other';

  if (!isOpen) return null;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} width="w-80" maxHeight="max-h-[80dvh]">
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
          <li>Finally squashed bug where swipe/touch navigation events were bubbling through to modals.</li>
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
            <p className="text-xs text-gray-300">
              This app works best when paired<br/> with the <b>YouVersion Bible App.</b>
            </p>
            {/* Platform-based link */}
            {platform === 'ios' && (
              <a
                href="https://apps.apple.com/ca/app/bible/id282935706"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline block mt-2"
              >
                Open in the Apple App Store
              </a>
            )}
            {platform === 'android' && (
              <a
                href="https://play.google.com/store/apps/details?id=com.sirma.mobile.bible.android"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline block mt-2"
              >
                Open in Google Play
              </a>
            )}
          </div>
        )}
      </div>
    </SlideOver>
  );
}
