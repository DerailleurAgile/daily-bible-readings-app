import type { NextConfig } from "next";
import { version } from './package.json';

const nextConfig: NextConfig = {
  compress: true,

  env: {
    NEXT_PUBLIC_APP_VERSION: version.trim(),
  },

  async headers() {
    return [
      {
        // This provides aggressive caching for monthly lectionary files.
        source: '/monthly/:file.json',
        headers: [
          {
            key: 'Cache-Control',
            // Immutable = never revalidate (safe because filename changes)
            // I've moved to this to address Android Chrome issues with
            // revalidation of these files.
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;