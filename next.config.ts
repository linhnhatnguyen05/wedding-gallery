import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  // Fix workspace root warning — point to this project
  outputFileTracingRoot: path.join(__dirname, './'),
  experimental: {},
};

export default nextConfig;
