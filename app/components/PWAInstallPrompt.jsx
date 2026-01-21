// app/components/PWAInstallPrompt.jsx
'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    // Check if already installed (multiple methods for better detection)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    const isPWA = isStandalone || isIOSStandalone;
    
    if (isPWA) {
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;

    if (isIOS) {
      setPlatform('ios');
      // Show iOS instructions after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    } else if (isAndroid || !isMobile) {
      setPlatform(isAndroid ? 'android' : 'desktop');
      
      // Listen for the beforeinstallprompt event (Android/Desktop)
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-500 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-blue-700 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Android/Desktop: Native install prompt */}
        {(platform === 'android' || platform === 'desktop') && deferredPrompt && (
          <div className="flex items-center gap-4">
            <Download className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Install Daily Prayer Readings</h3>
              <p className="text-sm text-blue-100">
                Add to your home screen for quick access and offline reading
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Install
            </button>
          </div>
        )}

        {/* iOS: Manual instructions */}
        {platform === 'ios' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Share className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Install on iPhone/iPad</h3>
                <ol className="text-sm text-blue-100 space-y-1 list-decimal list-inside">
                  <li>Tap the Share button <Share className="w-4 h-4 inline" /> in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}