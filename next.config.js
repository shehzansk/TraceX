/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID,
    ALCHEMY_ID: process.env.ALCHEMY_ID,
  },
};

module.exports = nextConfig
