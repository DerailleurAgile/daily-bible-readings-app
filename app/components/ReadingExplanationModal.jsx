import React, { useState } from 'react';
import { Loader2, Info } from 'lucide-react';

export default function ReadingExplanationModal({ 
  reference, 
  isOpen, 
  onClose,
  getExplanation,
  saveExplanation
}) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen && !explanation && !loading) {
      // Check cache first
      const cached = getExplanation(reference);
      if (cached) {
        setExplanation(cached);
      } else {
        fetchExplanation();
      }
    }
  }, [isOpen]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/explain-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });

      if (!response.ok) throw new Error('Failed to fetch explanation');
      
      const data = await response.json();
      setExplanation(data.explanation);
      
      // Save to cache
      saveExplanation(reference, data.explanation);
    } catch (err) {
      setError('Unable to load explanation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setExplanation('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Centered modal */}
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
          aria-label="Close explanation"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Understanding {reference}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
              <p className="text-gray-400">Loading explanation...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {explanation && !loading && (
            <div className="text-gray-200 leading-relaxed whitespace-pre-line" style={{ fontStyle: 'italic' }}>
              {explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}