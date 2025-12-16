import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development server
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
