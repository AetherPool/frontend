import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseSepolia, mainnet } from "@reown/appkit/networks";

// Get projectId from https://dashboard.reown.com
// Prefer NEXT_PUBLIC_PROJECT_ID for client-side usage; fall back to WALLET_CONNECT_PROJECT_ID or PROJECT_ID for server usage
export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID ?? process.env.WALLET_CONNECT_PROJECT_ID ?? process.env.PROJECT_ID ?? "";

if (!projectId) {
  // Avoid throwing during build/dev to keep the app previewable without env vars.
  // Developers should set NEXT_PUBLIC_PROJECT_ID in .env.local for full wallet functionality.
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_PROJECT_ID (or WALLET_CONNECT_PROJECT_ID / PROJECT_ID) is not defined. Wallet modal will be disabled.");
}

export const networks = [baseSepolia, mainnet];

// Create a hybrid storage that prefers localStorage in the browser
// but falls back to cookieStorage for SSR. This helps preserve
// wallet connection state when cookies are cleared but localStorage remains.
const isBrowser = typeof window !== "undefined";
const clientLocal = isBrowser ? window.localStorage : null;

const hybridStorage = {
  getItem(key: string) {
    try {
      if (clientLocal) {
        const v = clientLocal.getItem(key);
        if (v !== null) return v;
      }
    } catch (e) {
      /* ignore */
    }
    // cookieStorage may be undefined in certain runtimes; guard call
    try {
      return (cookieStorage as any).getItem?.(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key: string, value: any) {
    try {
      if (clientLocal) clientLocal.setItem(key, value);
    } catch (e) {
      /* ignore */
    }
    try {
      (cookieStorage as any).setItem?.(key, value);
    } catch (e) {
      /* ignore */
    }
  },
  removeItem(key: string) {
    try {
      if (clientLocal) clientLocal.removeItem(key);
    } catch (e) {
      /* ignore */
    }
    try {
      (cookieStorage as any).removeItem?.(key);
    } catch (e) {
      /* ignore */
    }
  },
};

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: isBrowser ? hybridStorage : cookieStorage,
  }),
  // Enable SSR only on server
  ssr: !isBrowser,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
