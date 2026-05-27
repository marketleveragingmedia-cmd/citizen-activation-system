import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reduce build memory usage
    workerThreads: false,
    cpus: 1,
  },
  // Optimize production builds
  swcMinify: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
