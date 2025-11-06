"use client";

import { useState } from "react";
import { Droplets, BarChart3, Zap, Settings } from "lucide-react";
import { Header } from "./header";
import { OverviewTab } from "./overview-tab";
import { PositionsTab } from "./positions-tab";
import { JITActivityTab } from "./jit-activity-tab";
import { ConfigTab } from "./config-tab";

export function AetherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data
  const stats = {
    totalLiquidity: "$1,234,567",
    activePositions: 5,
    totalEarnings: "$12,345",
    jitParticipations: 23,
  };

  const positions = [
    {
      id: 1,
      pair: "ETH/USDC",
      range: "1800-2200",
      liquidity: "$50,000",
      fees: "$234",
      apy: "12.5%",
      tokenA: {
        symbol: "ETH",
        amount: "2.5",
        price: 2000,
      },
      tokenB: {
        symbol: "USDC",
        amount: "5000",
        price: 1,
      },
      totalValue: "$55,000",
    },
    {
      id: 2,
      pair: "WBTC/ETH",
      range: "14-16",
      liquidity: "$30,000",
      fees: "$156",
      apy: "18.2%",
      tokenA: {
        symbol: "WBTC",
        amount: "0.8",
        price: 42000,
      },
      tokenB: {
        symbol: "ETH",
        amount: "15",
        price: 2000,
      },
      totalValue: "$33,600",
    },
    {
      id: 3,
      pair: "DAI/USDC",
      range: "0.99-1.01",
      liquidity: "$75,000",
      fees: "$89",
      apy: "8.7%",
      tokenA: {
        symbol: "DAI",
        amount: "75000",
        price: 1,
      },
      tokenB: {
        symbol: "USDC",
        amount: "75000",
        price: 1,
      },
      totalValue: "$150,000",
    },
  ];

  const recentJITs = [
    {
      time: "2m ago",
      pair: "ETH/USDC",
      amount: "$25,000",
      profit: "+$127",
      status: "completed",
    },
    {
      time: "15m ago",
      pair: "WBTC/ETH",
      amount: "$18,500",
      profit: "+$94",
      status: "completed",
    },
    {
      time: "1h ago",
      pair: "DAI/USDC",
      amount: "$40,000",
      profit: "+$203",
      status: "completed",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "positions", label: "Positions", icon: Droplets },
    { id: "jit", label: "JIT Activity", icon: Zap },
    { id: "config", label: "Configuration", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        tabs={tabs}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab stats={stats} recentJITs={recentJITs} />
        )}
        {activeTab === "positions" && <PositionsTab positions={positions} />}
        {activeTab === "jit" && <JITActivityTab recentJITs={recentJITs} />}
        {activeTab === "config" && <ConfigTab />}
      </main>
    </div>
  );
}
