import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development server
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://shumaila02-todo-backend-v2.hf.space'
  },
};

export default nextConfig;
