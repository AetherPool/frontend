import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PROJECT_ID: process.env.PROJECT_ID
  },
};

export default nextConfig;
