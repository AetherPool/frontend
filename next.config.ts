import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    if (!isServer) {
      // Silence common warnings
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "@react-native-async-storage/async-storage": false,
      };

      // Suppress circular dependency warnings from WASM workers
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /Circular dependency between chunks/,
      ];
    }

    return config;
  },
  env: {
    PROJECT_ID: process.env.PROJECT_ID,
    THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
    FEE_MANAGER: process.env.FEE_MANAGER,
    FEE_CALCULATOR: process.env.FEE_CALCULATOR,
    CONFIG_MANAGER: process.env.CONFIG_MANAGER,
    HOOK_SWAP_ROUTER: process.env.HOOK_SWAP_ROUTER,
    JIT_COORDINATOR: process.env.JIT_COORDINATOR,
    POSITION_MANAGER: process.env.POSITION_MANAGER,
    PROFIT_MANAGER: process.env.PROFIT_MANAGER,
    QRT_TOKEN: process.env.QRT_TOKEN,
    FYN_TOKEN: process.env.FYN_TOKEN,
    HOOK: process.env.HOOK,
    RPC_URL: process.env.RPC_URL,
  },
};

export default nextConfig;
