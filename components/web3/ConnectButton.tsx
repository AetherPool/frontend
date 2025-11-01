"use client"

import React, { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnect } from "wagmi";
import { useDisconnect } from "wagmi";
import { useChainId } from "wagmi";
import { useSwitchChain } from "wagmi";
import { Wallet, LogOut, Repeat, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { networks, } from "@/config";

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
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Check if current network is supported
  const isUnsupportedNetwork = isConnected && chainId && 
    !networks.some(n => n.id === chainId);

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
      // First try to get the Reown modal
      const win: any = typeof window !== "undefined" ? window : undefined;
      const reownModal = win?.__REOWN_MODAL__ ?? win?.modal ?? undefined;
      
      if (reownModal?.open) {
        await reownModal.open();
        return;
      }
      
      // If no Reown modal, open our menu (which shows connectors when disconnected)
      setMenuOpen(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error connecting wallet", err);
    } finally {
      setLoading(false);
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
      const provider = win?.ethereum;
      
      if (provider?.request) {
        const hex = `0x${chainId.toString(16)}`;
        try {
          // First try to switch to the network
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hex }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            const network = networks.find(n => n.id === chainId);
            if (network) {
              await provider.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: hex,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.nativeCurrency?.name ?? "Ether",
                    symbol: network.nativeCurrency?.symbol ?? "ETH",
                    decimals: network.nativeCurrency?.decimals ?? 18
                  },
                  rpcUrls: [network.rpcUrls.default.http[0]],
                  blockExplorerUrls: [network.blockExplorers?.default.url],
                }],
              });
            }
          } else {
            throw switchError;
          }
        }
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
        <Button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className={`flex items-center gap-2 ${
            isUnsupportedNetwork 
              ? "bg-amber-600 hover:bg-amber-700" 
              : "bg-green-600 hover:bg-green-700"
          } text-white`} 
          size="sm"
        >
          {isUnsupportedNetwork ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span className="font-medium">{formatAddress(address)}</span>
        </Button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-900 border border-blue-900/50 shadow-lg z-50">
              <div className="py-2">
                {isUnsupportedNetwork && (
                  <div className="px-4 py-2 text-sm text-amber-400 bg-amber-950/30 flex items-center gap-2 border-b border-amber-900/30">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Unsupported Network</span>
                  </div>
                )}

                <div className="px-4 py-2 text-xs text-gray-400">Account</div>
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

                <div className="px-4 py-2 text-xs text-gray-400">Available Networks</div>
                <div className="max-h-[200px] overflow-y-auto">
                  {networks.map((n) => (
                    <button
                      key={n.id}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2 ${
                        chainId === n.id ? "text-green-400" : ""
                      }`}
                      onClick={() => switchChain?.({ chainId: n.id })}
                      disabled={chainId === n.id}
                    >
                      <Globe className="w-4 h-4" />
                      {n.name}
                      {chainId === n.id && <span className="text-xs ml-auto">Connected</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border/30 my-1" />

                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2"
                  onClick={() => {
                    if (connectors.length > 0) {
                      setMenuOpen(true);
                    }
                  }}
                >
                  <Repeat className="w-4 h-4" />
                  Connect Another Wallet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (!isConnected && menuOpen) {
    return (
      <div className="relative" ref={menuRef}>
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setMenuOpen(false)} />
        <div className="absolute right-0 mt-2 w-80 rounded-lg bg-slate-900 border border-blue-900/50 shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700 font-medium">Connect Wallet</div>
            <div className="max-h-[300px] overflow-y-auto">
              {connectors.map((connector) => {
                // Some connectors (injected) may not expose `ready` reliably across envs.
                // Treat injected as ready when window.ethereum exists.
                const injectedReady = typeof window !== "undefined" && (connector.id === "injected") && Boolean((window as any).ethereum);
                const ready = Boolean((connector as any).ready) || injectedReady;

                return (
                  <button
                    key={connector.id}
                    onClick={() => {
                      connect({ connector });
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3"
                    disabled={!ready}
                  >
                    <span className="flex-1 font-medium">{connector.name}</span>
                    {!ready && <span className="text-xs text-gray-500">Not installed</span>}
                    {ready && <span className="text-xs text-green-500">Ready</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-slate-800 border-t border-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
        <Button
          onClick={() => setMenuOpen(false)}
          className={`bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white`}
          size="sm"
        >
          <Wallet className="w-4 h-4 mr-2" />
          <span>Connect Wallet</span>
        </Button>
      </div>
    );
  }

  // Handle disconnecting and closing menu
  const handleDisconnect = () => {
    disconnect();
    setMenuOpen(false);
  };

  return (
    <Button
      onClick={() => setMenuOpen(true)}
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

