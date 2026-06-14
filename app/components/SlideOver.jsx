// app/components/SlideOver.jsx - Fully Centered Modal with Blur
import { useEffect } from 'react';

export default function SlideOver({ isOpen, onClose, children, width = 'w-80', maxHeight = 'max-h-[80vh]', showCloseButton = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Blurred backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 min-h-[100dvh] bg-black/30 backdrop-blur-sm transition-all duration-300 z-40 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Centered panel */}
          <div
            data-modal
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className={`${width} max-w-[calc(100%-2rem)] bg-gray-900 border border-gray-700 rounded-lg 
            transform transition-all duration-300 shadow-2xl
            ${isOpen 
              ? 'scale-100 opacity-100' 
              : 'scale-95 opacity-0'
            }`}
          >
            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 z-10"
                aria-label="Close Modal"
              >
                ✕
              </button>
            )}

            <div className={`p-6 overflow-y-auto ${maxHeight}`} style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}