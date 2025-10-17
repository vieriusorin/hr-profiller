import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add polyfills for server-side rendering
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
