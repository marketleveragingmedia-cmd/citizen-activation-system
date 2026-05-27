import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reduce build memory usage
    workerThreads: false,
    cpus: 1,
  },
  // Skip TypeScript and ESLint during build to save memory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
