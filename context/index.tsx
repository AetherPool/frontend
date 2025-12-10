"use client";

import { wagmiAdapter, projectId } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia, mainnet } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const origin =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://aetherpool.vercel.app";

// Set up metadata
const metadata = {
  name: "AetherPool",
  description: "Multi-LP JIT liquidity protocol with FHE encryption",
  url: origin,
  icons: [""],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia, mainnet],
  defaultNetwork: baseSepolia,
  metadata: metadata,
  features: {
    analytics: false, // Disable analytics
    email: true,
    socials: ["google", "x", "github", "discord", "farcaster"],
    emailShowWallets: true,
  },
  allWallets: "SHOW",
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#9333ea",
    "--w3m-border-radius-master": "8px",
  },
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
