import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Set root to current directory to prevent parent workspace detection
      root: process.cwd(),
    },
  },
};

export default nextConfig;
