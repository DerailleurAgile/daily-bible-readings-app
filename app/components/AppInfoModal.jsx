'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import packageJson from '../../package.json';
import SlideOver from './SlideOver'; // Reduce, reuse, recyle kids!
import useMobilePlatform from '../hooks/useMobilePlatform';

export default function AppInfoModal({ isOpen, onClose }) {
  const [showQR, setShowQR] = useState(false);
  const platform = useMobilePlatform();

  if (!isOpen) return null;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} width="w-80" maxHeight="max-h-[80dvh]">
      <h3 className="text-gray-100 font-semibold mb-2 text-center">
        The Daily Office
      </h3>

      <p className="text-sm text-gray-300 text-center mb-4">
        St. Paul's Bloor Street<br/>Lectionary (2025/26)
        <br />
        <span className="text-xs text-amber-300">
          Version {packageJson.version}
        </span>
      </p>

      <div className="text-center mb-4">
        <a
          href="https://www.stpaulsbloor.org/wp-content/uploads/2025/05/SPBS_DailyPrayerBook_2025_Final-combined.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Download the Daily Prayer Book PDF
        </a>
      </div>

      <div className="text-xs text-gray-400 space-y-2 mb-4">
        <p className="text-amber-300"><strong>What's New?</strong></p>
        <ul className="list-disc list-outside ml-5 space-y-1">
          <li>Prayer texts are now cached locally — opens instantly and works offline.</li>
          <li>Evicted a ghost URL from the readings loader that was causing 404s. Haunting over.</li>
          <li>Made improvements you can't see, but they're there.</li>
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
