// components/UpdateBanner.jsx
export default function UpdateBanner({ updateAvailable }) {
  if (!updateAvailable) return null;

  return (
    <div className="bg-yellow-900/40 border border-yellow-500 p-3 rounded mb-4 text-center text-yellow-100">
      ⚠️ A new version of the app is available.{' '}
      <button
        onClick={() => window.location.reload()}
        className="underline font-semibold"
      >
        Click here to refresh
      </button>
      {' '}and get the latest updates.
    </div>
  );
}