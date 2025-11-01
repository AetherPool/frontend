"use client"

import React, { useEffect, useState, useRef } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { Wallet, LogOut, Repeat, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { networks } from "@/config";

/**
 * ConnectButton
 * - Shows a gradient "Connect Wallet" button when disconnected
 * - Shows truncated address and a menu when connected
 * - Menu supports: Disconnect, Switch Network, Connect Another Wallet, Quick Connect
 */
export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isConnected) setLoading(false);
  }, [isConnected]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleOpen = async () => {
    try {
      setLoading(true);
      // Prefer a globally-exposed modal to avoid importing context which may throw
      const win: any = typeof window !== "undefined" ? window : undefined;
      const candidate = win?.__REOWN_MODAL__ ?? win?.modal ?? undefined;
      if (candidate && typeof candidate.open === "function") {
        candidate.open();
        return;
      }

      // eslint-disable-next-line no-console
      console.warn("No Reown modal found. Ensure NEXT_PUBLIC_PROJECT_ID is set and ContextProvider is wired.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error opening wallet modal", err);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const handleConnectAnother = async (connector: any) => {
    try {
      setLoading(true);
      await connect({ connector });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error connecting another wallet/address", e);
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    try {
      setLoading(true);
      const win: any = typeof window !== "undefined" ? window : undefined;
      const provider = win?.ethereum ?? win?.window?.ethereum ?? undefined;
      if (provider && provider.request) {
        const hex = typeof chainId === "number" ? `0x${chainId.toString(16)}` : chainId;
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
      } else {
        // eslint-disable-next-line no-console
        console.warn("No injected provider to switch network");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error switching network", e);
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className="relative" ref={menuRef}>
        <Button onClick={() => setMenuOpen(!menuOpen)} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" size="sm">
          <Wallet className="w-4 h-4" />
          <span className="font-medium">{formatAddress(address)}</span>
        </Button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 rounded-md bg-slate-900 border border-blue-900/50 shadow-lg z-50">
            <div className="py-2">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2"
                onClick={() => {
                  disconnect();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>

              <div className="border-t border-border/30 my-1" />

              <div className="px-2 text-xs text-gray-400">Switch Network</div>
              {networks.map((n: any) => (
                <button
                  key={n.id}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2"
                  onClick={() => handleSwitchNetwork(n.id)}
                >
                  <Globe className="w-4 h-4" />
                  {n.name}
                </button>
              ))}

              <div className="border-t border-border/30 my-1" />

              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2"
                  onClick={() => {
                  try {
                    const win: any = typeof window !== "undefined" ? window : undefined;
                    const candidate = win?.__REOWN_MODAL__ ?? win?.modal ?? undefined;
                    if (candidate && typeof candidate.open === "function") candidate.open();
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                  }
                  setMenuOpen(false);
                }}
              >
                <Repeat className="w-4 h-4" />
                Connect Another Wallet
              </button>

              {connectors && connectors.length > 0 && (
                <>
                  <div className="border-t border-border/30 my-1" />
                  <div className="px-2 text-xs text-gray-400">Quick Connect</div>
                  {connectors.map((c) => (
                    <button
                      key={c.id}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2"
                      onClick={() => handleConnectAnother(c)}
                    >
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleOpen}
      className={`bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white`}
      size="sm"
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      <span>{loading ? "Connecting..." : "Connect Wallet"}</span>
    </Button>
  );
}

