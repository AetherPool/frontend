import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PROJECT_ID: process.env.PROJECT_ID,
    THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY
  },
};

export default nextConfig;
