import type { NextConfig } from "next";
import { version } from './package.json';

const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression

  // Expose the app version to the client-side code
  env: {
    NEXT_PUBLIC_APP_VERSION: version.trim(),
  },
};

export default nextConfig;
