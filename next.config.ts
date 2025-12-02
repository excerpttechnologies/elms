import type { NextConfig } from "next";

const nextConfig: NextConfig & { swcMinify?: boolean } = {
  /* config options here */
  images: {
    domains: ['localhost', 'your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Optimize performance
  swcMinify: true,
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
