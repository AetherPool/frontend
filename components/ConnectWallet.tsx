"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { getBasename } from "@superdevfavour/basename";
import { Button } from "./ui/button";
import { Wallet, LogOut } from "lucide-react";

interface ConnectWalletProps {
  onConnect?: () => void;
  label?: string;
}

const ConnectWallet = ({
  onConnect,
  label = "Connect Wallet",
}: ConnectWalletProps) => {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [basename, setBasename] = useState<string | null>(null);
  const [isLoadingBasename, setIsLoadingBasename] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Basename for connected wallet
  useEffect(() => {
    const fetchBasename = async () => {
      if (!address) {
        setBasename(null);
        return;
      }

      try {
        setIsLoadingBasename(true);
        const name = await getBasename(address);
        setBasename(name || null);
      } catch (error) {
        console.log("No Basename found or error fetching:", error);
        setBasename(null);
      } finally {
        setIsLoadingBasename(false);
      }
    };

    fetchBasename();
  }, [address]);

  // Call onConnect when connected
  useEffect(() => {
    if (isConnected && onConnect) {
      onConnect();
    }
  }, [isConnected, onConnect]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".wallet-menu-container")) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  // Format display name: Basename or shortened address
  const getDisplayName = () => {
    if (isLoadingBasename && address) {
      return "Loading...";
    }
    if (basename) {
      return basename;
    }
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return label;
  };

  if (!mounted) {
    return (
      <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        {label}
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="relative wallet-menu-container">
        <Button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          {getDisplayName()}
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="p-4 border-b border-slate-700">
              <p className="text-xs text-gray-400 mb-2">Connected Account</p>
              <p className="text-sm text-white font-mono">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>

            <div className="p-2">
              <button
                onClick={() => open()}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-slate-700 rounded-lg transition-colors mb-1"
              >
                <Wallet className="w-4 h-4" />
                Account Details
              </button>

              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default ConnectWallet;
