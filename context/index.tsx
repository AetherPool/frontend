"use client";

import { wagmiAdapter, projectId } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia, mainnet } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { useEffect } from "react";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  // Don't throw here during build; warn so builds and previews work without env var.
  // The modal will be a no-op until a valid project id is provided via env.
  // eslint-disable-next-line no-console
  console.warn("Project ID is not defined. Reown modal will be disabled until NEXT_PUBLIC_PROJECT_ID is set.");
}

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create and export the modal (noop when projectId is missing)
export const modal = projectId
  ? createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: [baseSepolia, mainnet],
      defaultNetwork: baseSepolia,
      metadata: metadata,
      features: {
        analytics: true,
      },
    })
  : ({} as any);

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

// Expose modal globally on client for components that need to open it
// without importing the context module directly (safe noop if modal is empty).
function exposeModalOnWindow() {
  try {
    if (typeof window !== "undefined") {
      // attach in a non-enumerable way to avoid accidental overwrites
      (window as any).__REOWN_MODAL__ = modal;
    }
  } catch (e) {
    // ignore
  }
}

// Run on module load in client (this module is client-side) — also allow callers
// to call exposeModalOnWindow from a client effect if needed.
exposeModalOnWindow();

export default ContextProvider;
