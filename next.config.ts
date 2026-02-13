import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.0.146:3002',
  },
  allowedDevOrigins: [
    '192.168.0.146',
    '192.168.11.15',
    'localhost',
    '127.0.0.1'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.0.146:3002/api/:path*',
      },
    ];
  },
};

export default nextConfig;
