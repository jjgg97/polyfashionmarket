/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { domains: ['images.unsplash.com'] },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, os: false, path: false, crypto: false };
    }
    config.module.rules.push({ test: /\.m?js$/, resolve: { fullySpecified: false } });
    return config;
  },
};
module.exports = nextConfig;
