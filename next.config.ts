//
import type { NextConfig } from "next";
import { version } from './package.json';

const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression

  // Expose the app version to the client-side code
  env: {
    NEXT_PUBLIC_APP_VERSION: version.trim(),
  },

  // Configure cache headers for lectionary data files
  async headers() {
    return [
      {
        source: '/monthly/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
