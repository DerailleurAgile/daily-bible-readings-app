// next.config.ts
import type { NextConfig } from "next";
import { version } from './package.json';

// @ts-ignore - next-pwa doesn't have official types
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  compress: true,

  // Silence TurboPack warnings...
  turbopack: {},

  env: {
    NEXT_PUBLIC_APP_VERSION: version.trim(),
  },

  async headers() {
    return [
      {
        source: '/monthly/:file.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60
        }
      }
    },
    {
      // Cache HTML pages (NavigationPreload for better UX)
      urlPattern: ({ request }: any) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60
        },
        networkTimeoutSeconds: 3
      }
    },
    {
      urlPattern: /\/monthly\/.*\.json$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'lectionary-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 365 * 24 * 60 * 60
        }
      }
    },
    {
      urlPattern: /\.(?:json)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'json-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|png|gif|svg|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60
        }
      }
    }
  ]
});

export default pwaConfig(nextConfig);