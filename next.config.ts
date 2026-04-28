import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  ...(isDev ? {
    allowedDevOrigins: ['192.168.0.7', 'localhost:3000'],
  } : {}),
};

export default nextConfig;
