// components/AppFooter.jsx
import packageJson from '../../package.json';

export default function AppFooter({ platform }) {
  return (
    <div className="text-center text-sm text-gray-500 pt-6 space-y-2">
      {/* Mobile hint */}
      <div className="text-xs text-amber-400 flex items-center justify-center gap-1 md:hidden">
        <span>💡</span>
        <span>← Swipe → to change days, or double-tap for today</span>
      </div>

      {/* Desktop navigation tip */}
      <div className="pt-2 text-xs text-amber-400 hidden md:block">
        <p>💡 Use ← and → keys to change days, and ↑ to jump back to today</p>
      </div>

      {/* New primary message */}
      <p className="text-gray-300 font-medium">
        This app works best when paired<br/> with the <b>YouVersion Bible App.</b>
      </p>

      {/* Platform-based link */}
      {platform === 'ios' && (
        <a 
          href="https://apps.apple.com/ca/app/bible/id282935706"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline block"
        >
          Open in the Apple App Store
        </a>
      )}

      {platform === 'android' && (
        <a
          href="https://play.google.com/store/apps/details?id=com.sirma.mobile.bible.android"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline block"
        >
          Open in Google Play
        </a>
      )}

      {/* Copyright */}
      <p className="text-gray-600">
        © {new Date().getFullYear()} Chris R. Chapman. All rights reserved.
      </p>

      {/* Version tag */}
      <span className="text-gray-600">v {packageJson.version}</span>
    </div>
  );
}