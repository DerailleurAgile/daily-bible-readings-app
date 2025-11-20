import type { NextConfig } from "next";
import { version } from './package.json';

const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression

  env: {
    NEXT_PUBLIC_APP_VERSION: version, // expose version to client
  },
};

export default nextConfig;
