// components/PrayerModal.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const POSITION_LABELS = {
  opening: 'Opening Prayer',
  between: 'Between Psalms & Lesson',
  closing: 'Closing Prayers',
};

export default function PrayerModal({ isOpen, onClose, session, position }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !session || !position) return;

    setContent('');
    setError(null);
    setLoading(true);

    const period = session === 'AM' ? 'morning' : 'evening';

    fetch(`/prayers/${period}-${position}.txt`)
      .then((res) => {
        if (!res.ok) throw new Error('Prayer file not found');
        return res.text();
      })
      .then((text) => setContent(text))
      .catch(() => setError('Unable to load prayer. Please try again.'))
      .finally(() => setLoading(false));
  }, [isOpen, session, position]);

  if (!isOpen) return null;

  const label = POSITION_LABELS[position] ?? 'Prayer';

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-[600px] max-w-[calc(100%-2rem)] bg-gray-900 border border-gray-700 rounded-lg
          transform transition-all duration-300 shadow-2xl
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 z-10"
          aria-label="Close prayer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <span>🙏</span>
            {label}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-gray-400">Loading prayer...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {content && !loading && (
            <div
              className="text-gray-200 leading-relaxed whitespace-pre-line font-serif text-[0.95rem]"
            >
              {content.split('\n').map((line, i) => {
                // Section headers (all-caps lines)
                if (/^[A-Z][A-Z\s]+$/.test(line.trim()) && line.trim().length > 1) {
                  return (
                    <p key={i} className="text-xs font-medium tracking-widest text-gray-400 uppercase mt-6 mb-2 font-sans">
                      {line}
                    </p>
                  );
                }
                // Versicle/response lines (V. / R.)
                if (/^[VR]\.\s/.test(line.trim())) {
                  return (
                    <p key={i} className="text-gray-100">
                      <span className="text-gray-500 font-sans text-xs mr-1">
                        {line.trim().slice(0, 2)}
                      </span>
                      {line.trim().slice(3)}
                    </p>
                  );
                }
                // Scripture references (lines starting with —)
                if (line.trim().startsWith('—')) {
                  return (
                    <p key={i} className="text-gray-500 text-sm mt-1 font-sans">
                      {line}
                    </p>
                  );
                }
                // Rubric lines (italicised instructions)
                if (
                  line.trim().startsWith('Begin by') ||
                  line.trim().startsWith('Tell God') ||
                  line.trim().startsWith('Take time') ||
                  line.trim().startsWith('Read the') ||
                  line.trim().endsWith('Then say:') ||
                  line.trim().endsWith('say:')
                ) {
                  return (
                    <p key={i} className="text-gray-400 italic font-sans text-sm">
                      {line}
                    </p>
                  );
                }
                // "or" divider
                if (line.trim() === 'or') {
                  return (
                    <p key={i} className="text-gray-500 text-sm italic text-center my-3 font-sans">
                      or
                    </p>
                  );
                }
                // Empty lines
                if (line.trim() === '') {
                  return <div key={i} className="h-3" />;
                }
                // Default
                return <p key={i}>{line}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}