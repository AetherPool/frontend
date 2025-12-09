"use client";

import { thirdwebClient, wallets } from "@/app/client";
import { useEffect, useState } from "react";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import type { Account } from "thirdweb/wallets";
import { useChainSwitch } from "@/hooks/useChainSwitch";
import { baseSepolia } from "thirdweb/chains";
import { getBasename } from "@superdevfavour/basename";

interface ConnectWalletProps {
  onConnect?: () => void;
  label?: string;
}

const ConnectWallet = ({
  onConnect,
  label = "Connect Wallet",
}: ConnectWalletProps) => {
  const [mounted, setMounted] = useState(false);
  const account = useActiveAccount();
  const [prevAccount, setPrevAccount] = useState<Account | undefined>(
    undefined
  );
  const [basename, setBasename] = useState<string | null>(null);
  const [isLoadingBasename, setIsLoadingBasename] = useState(false);
  const { isOnCorrectChain, switchToBaseSepolia } = useChainSwitch();

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://aetherpool.vercel.app";

  const metadata = {
    name: "AetherPool - Privacy-First JIT Liquidity",
    description: "Multi-LP JIT liquidity protocol with FHE encryption",
    url: origin,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Basename for connected wallet
  useEffect(() => {
    const fetchBasename = async () => {
      if (!account?.address) {
        setBasename(null);
        return;
      }

      try {
        setIsLoadingBasename(true);
        const name = await getBasename(`0x${account.address}`);
        setBasename(name || null);
      } catch (error) {
        console.log("No Basename found or error fetching:", error);
        setBasename(null);
      } finally {
        setIsLoadingBasename(false);
      }
    };

    fetchBasename();
  }, [account?.address]);

  useEffect(() => {
    if (account && !prevAccount && onConnect) {
      onConnect();
    }
    setPrevAccount(account);
  }, [account, prevAccount, onConnect]);

  // Auto-switch to correct chain when wallet connects
  useEffect(() => {
    if (account && !isOnCorrectChain) {
      // Small delay to ensure wallet is fully connected
      const timer = setTimeout(() => {
        switchToBaseSepolia();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [account, isOnCorrectChain, switchToBaseSepolia]);

  // Format display name: Basename or shortened address
  const getDisplayName = () => {
    if (isLoadingBasename && account) {
      return "Loading...";
    }
    if (basename) {
      return basename;
    }
    if (account?.address) {
      return `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
    }
    return label;
  };

  if (!mounted) return null;

  return (
    <div>
      <div className="hidden md:flex">
        <ConnectButton
          client={thirdwebClient}
          appMetadata={metadata}
          connectButton={{
            label: account ? getDisplayName() : label,
          }}
          wallets={wallets}
          connectModal={{ size: "compact" }}
          chain={baseSepolia}
          chains={[baseSepolia]}
          theme={darkTheme({
            colors: {
              primaryButtonBg: "#9333ea",
              primaryButtonText: "#ffffff",
            },
          })}
        />
      </div>
      <div className="md:hidden flex">
        <ConnectButton
          client={thirdwebClient}
          appMetadata={metadata}
          connectButton={{
            label: account ? getDisplayName() : label,
          }}
          wallets={wallets}
          connectModal={{ size: "compact" }}
          chain={baseSepolia}
          chains={[baseSepolia]}
          theme={darkTheme({
            colors: {
              primaryButtonBg: "#9333ea",
              primaryButtonText: "#ffffff",
            },
          })}
        />
      </div>
    </div>
  );
};

export default ConnectWallet;
