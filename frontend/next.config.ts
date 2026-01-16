import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development server
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8001'
  },
};

export default nextConfig;
