/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID,
    ALCHEMY_ID: process.env.ALCHEMY_ID,
  },
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors during build
  }
};

module.exports = nextConfig
