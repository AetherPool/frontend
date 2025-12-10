"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  Droplets,
  BarChart3,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { SwapWidget } from "@/components/swap/swap-widget";
import { AddLiquidityWidget } from "@/components/liquidity/add-liquidity-widget";
import { TokenFaucet } from "@/components/faucet/token-faucet";
import { JITConfigModal } from "@/components/jit-config/jit-config-modal";
import ConnectWallet from "@/components/ConnectWallet";
import Link from "next/link";

type ActiveWidget = "swap" | "liquidity" | "faucet";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
}

interface PositionData {
  tokenA: Token;
  tokenB: Token;
  amountA: string;
  amountB: string;
  tickLower: string;
  tickUpper: string;
}

export default function Home() {
  const [activeWidget, setActiveWidget] = useState<ActiveWidget>("swap");
  const [showJITConfig, setShowJITConfig] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<PositionData | null>(
    null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleJITConfigRequired = (positionData: PositionData) => {
    setPendingPosition(positionData);
    setShowJITConfig(true);
  };

  const handleJITComplete = () => {
    setShowJITConfig(false);
    setPendingPosition(null);
    // Could redirect to dashboard or show success message
  };

  const handleJITBack = () => {
    setShowJITConfig(false);
  };

  const handleWalletConnect = () => {
    console.log("Wallet connected successfully!");
    // Add any additional logic to run when wallet connects
  };

  const navItems = [
    { id: "swap", label: "Swap", icon: ArrowLeftRight },
    { id: "liquidity", label: "Add Liquidity", icon: Plus },
    { id: "faucet", label: "Faucet", icon: Droplets },
  ];

  const dashboardLinks = [
    { href: "/dashboard", label: "Overview", icon: BarChart3 },
    { href: "/dashboard/positions", label: "Positions", icon: Droplets },
    { href: "/dashboard/jit", label: "JIT Activity", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                AetherPool
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveWidget(item.id as ActiveWidget)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeWidget === item.id
                        ? "bg-linear-to-r from-cyan-500/20 to-purple-600/20 text-white border border-purple-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <div className="w-px h-6 bg-border mx-2" />
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
            </nav>

            <div className="hidden md:block">
              <ConnectWallet
                onConnect={handleWalletConnect}
                label="Connect Wallet"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveWidget(item.id as ActiveWidget);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all ${
                      activeWidget === item.id
                        ? "bg-linear-to-r from-cyan-500/20 to-purple-600/20 text-white border border-purple-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <div className="border-t border-border/50 pt-2 mt-2">
                {dashboardLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              {/* Mobile ConnectWallet */}
              <ConnectWallet
                onConnect={handleWalletConnect}
                label="Connect Wallet"
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Privacy-First
            </span>{" "}
            JIT Liquidity
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Provide liquidity with encrypted parameters using FHE. Participate
            in JIT auctions or earn passive fees with full privacy protection.
          </p>
        </div>

        {/* Widget Container */}
        <div className="flex justify-center">
          {activeWidget === "swap" && <SwapWidget />}
          {activeWidget === "liquidity" && (
            <AddLiquidityWidget onJITConfigRequired={handleJITConfigRequired} />
          )}
          {activeWidget === "faucet" && <TokenFaucet />}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-linear-to-b from-slate-900/60 to-slate-900/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              JIT Liquidity
            </h3>
            <p className="text-sm text-muted-foreground">
              Participate in Just-In-Time liquidity auctions with encrypted bid
              parameters for MEV protection.
            </p>
          </div>
          <div className="bg-linear-to-b from-slate-900/60 to-slate-900/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Droplets className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              FHE Encryption
            </h3>
            <p className="text-sm text-muted-foreground">
              All LP parameters encrypted using Fully Homomorphic Encryption.
              Your strategy stays private.
            </p>
          </div>
          <div className="bg-linear-to-b from-slate-900/60 to-slate-900/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Multi-LP Coordination
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatic coordination and profit distribution when multiple LPs
              have overlapping ranges.
            </p>
          </div>
        </div>
      </main>

      {/* JIT Configuration Modal */}
      <JITConfigModal
        open={showJITConfig}
        onOpenChange={setShowJITConfig}
        positionData={pendingPosition}
        onComplete={handleJITComplete}
        onBack={handleJITBack}
      />
    </div>
  );
}
