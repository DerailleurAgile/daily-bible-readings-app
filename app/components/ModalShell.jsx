// app/components/ModalShell.jsx
export default function ModalShell({ children, onClose }) {
  const stopTouch = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={stopTouch}
        onTouchMove={stopTouch}
        onTouchEnd={stopTouch}
      >
        {children}
      </div>
    </div>
  );
}