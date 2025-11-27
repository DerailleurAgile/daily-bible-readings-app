// app/components/SlideOver.jsx - Fully Centered Modal with Blur
export default function SlideOver({ isOpen, onClose, children }) {
  return (
    <>
      {/* Blurred backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 z-40 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Centered panel */}
          <div
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            className={`w-80 max-w-[calc(100%-2rem)] bg-gray-900 border border-gray-700 rounded-lg 
            transform transition-all duration-300 shadow-2xl
            ${isOpen 
              ? 'scale-100 opacity-100' 
              : 'scale-95 opacity-0'
            }`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 z-10"
              aria-label="Close settings"
            >
              ✕
            </button>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}